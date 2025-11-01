import React, {
  Suspense,
  useMemo,
  useEffect,
  useRef,
  useLayoutEffect,
} from "react";
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
    return { minY: box.min.y, maxY: box.max.y };
  }, [scene]);

  const CLIP_OFFSET = 0.35; // tweak (meters) how much above the camera we cut when outside
  const CEILING_MARGIN = 0.1; // how close to the roof we consider "outside"

  // Make plane follow the camer height
  useFrame(() => {
    if (camera.position.y >= bounds.maxY - CEILING_MARGIN) {
      ceilingPlane.constant = camera.position.y + CLIP_OFFSET;
    } else {
      ceilingPlane.constant = 1e6;
    }
  });

  // One-time traverse: enforce FrontSide and attach clipping plane
  React.useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        // Backface culling: only render the front faces
        child.material.side = THREE.FrontSide;

        // Attach clipping plane
        child.material.clippingPlanes = [ceilingPlane];
        child.material.needsUpdate = true;
      }
    });
  }, [scene, ceilingPlane]);

  return <primitive object={scene} />;
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
        <Canvas camera={{ position: [5, 5, 5], fov: 45 }}>
          <ambientLight />
          <directionalLight position={[5, 5, 5]} intensity={0.9} />
          <Suspense fallback={<Loader />}>
            <Bounds fit observe margin={1}>
              <LabModel key={lab.modelPath} path={lab.modelPath} />
            </Bounds>
            <Environment preset="city" />
          </Suspense>
          <OrbitControls makeDefault enablePan enableZoom enableRotate />
        </Canvas>
      </div>
    </Box>
  );
}
