import React, { Suspense, useMemo, useEffect, useRef } from "react";
import * as THREE from "three";
import { Link as RouterLink, useParams } from "react-router-dom";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  Bounds,
  Html,
  useProgress,
  Environment,
} from "@react-three/drei";

import { LABS } from "../config/labs";
import { Box, Button, Stack, Typography } from "@mui/material";

function Loader() {
  const { progress } = useProgress();
  return (
    <Html
      center
      style={{ fontFamily: "system-ui", fontSize: 14, pointerEvents: "none" }}
    >
      {Math.round(progress)}%
    </Html>
  );
}

function LabModel({ path }) {
  useGLTF.preload(path); // Preload specific lab file

  // Create a scene, camera, and renderer
  const { scene } = useGLTF(path);
  const { gl, camera } = useThree();
  const controls = useThree((s) => s.controls);

  // Enable clipping
  useEffect(() => {
    gl.localClippingEnabled = true;
  }, [gl]);

  // Horizontal clipping plane to hide above cameraY and offset
  const ceilingPlane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, -1, 0), -1e6),
    []
  );

  const bounds = React.useMemo(() => {
    scene.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(scene);
    return { minY: box.min.y, maxY: box.max.y, box };
  }, [scene]);

  // Set initial orbit target to model center
  useLayoutEffect(() => {
    if (controls && bounds.box) {
      const center = bounds.box.getCenter(new THREE.Vector3());
      controls.target.copy(center);
      controls.update();
    }
  }, [controls, bounds.box]);

  const CLIP_OFFSET = 0.35; // tweak (meters) how much above the camera we cut when outside
  const CEILING_MARGIN = 0.1; // how close to the roof we consider "outside"

  // Make plane follow the camer height
  useFrame(() => {
    if (camera.position.y >= bounds.maxY - CEILING_MARGIN) {
      ceilingPlane.constant = camera.position.y + CLIP_OFFSET;
    } else {
      ceilingPlane.constant = -1e6;
    }
  });

  // One-time traverse: enforce FrontSide and attach clipping plane
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        // Backface culling: only render the front faces
        child.material.side = THREE.FrontSide;

        // Attach clipping plane
        // handle single or multi-material
        const apply = (mat) => {
          if (!mat) return;
          mat.clippingPlanes = [ceilingPlane];
          mat.needsUpdate = true;
        };
        if (Array.isArray(child.material)) child.material.forEach(apply);
        else apply(child.material);
      }
    });
  }, [scene, ceilingPlane]);

  return <primitive object={scene} />;
}

function InteractiveControls() {
  const controlsRef = useRef();
  const { camera, gl, scene } = useThree();
  const raycaster = React.useMemo(() => new THREE.Raycaster(), []);
  const mouse = React.useMemo(() => new THREE.Vector2(), []);

  useEffect(() => {
    const el = gl.domElement;
    const onDblClick = (event) => {
      const rect = el.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      if (intersects.length && controlsRef.current) {
        // orbit around the point clicked
        controlsRef.current.target.copy(intersects[0].point);
        controlsRef.current.update();
      }
    };
    el.addEventListener("dblclick", onDblClick);
    return () => el.removeEventListener("dblclick", onDblClick);
  }, [camera, gl, raycaster, mouse, scene]);

  // Robust pan/orbit feel
  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      enablePan
      panSpeed={1.5}
      screenSpacePanning
      rotateSpeed={0.9}
      minDistance={0.4}
      maxDistance={25}
      maxPolarAngle={Math.PI * 0.495} // keep from flipping under the floor
      mouseButtons={{
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN,
      }}
      touches={{
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN,
      }}
      onChange={() => controlsRef.current?.update()}
      // set up the dblclick handler after the controls exist
      onPointerMissed={(e) => {}}
    />
  );
}

export default function Map3D() {
  const { labId } = useParams();
  const lab = useMemo(() => LABS.find((l) => l.id === labId), [labId]);

  if (!lab) {
    return (
      <Box>
        <Typography variant="h2">Lab not found</Typography>
        <Button
          sx={{ mt: 2 }}
          component={RouterLink}
          to="/map3d"
          variant="contained"
        >
          Back to Labs
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Typography variant="h1">{lab.name}</Typography>
        <Button
          variant="contained"
          color="secondary"
          size="small"
          component={RouterLink}
          to="/map3d"
        >
          Go Back To All Labs
        </Button>
      </Stack>
      {/* Camera View */}
      <div style={{ height: "80vh", width: "100%" }}>
        <Canvas
          camera={{ position: [5, 5, 5], fov: 45 }}
          style={{
            width: "100%",
            height: "100%",
            touchAction: "none",
            cursor: "grab",
          }}
          onCreated={({ gl }) => {
            gl.domElement.style.touchAction = "none";
          }}
        >
          <ambientLight />
          <directionalLight position={[5, 5, 5]} intensity={0.9} />
          <InteractiveControls />
          <Suspense fallback={<Loader />}>
            <Bounds fit observe>
              <LabModel path={lab.modelPath} />
            </Bounds>
            <Environment preset="city" />
          </Suspense>
        </Canvas>
      </div>
    </Box>
  );
}
