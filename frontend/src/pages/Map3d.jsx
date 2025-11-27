import {
  Suspense,
  useMemo,
  useEffect,
  useState,
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

import { getLabById } from "../lib/supabaseLabs";
import { getEquipment } from "../lib/supabaseItems";
import { Box, Button, Stack, Typography, CircularProgress } from "@mui/material";

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

  // Enable clipping
  useEffect(() => {
    gl.localClippingEnabled = true;
  }, [gl]);

  // Horizontal clipping plane to hide above cameraY and offset
  const ceilingPlane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, -1, 0), -1e6),
    []
  );

  const bounds = useMemo(() => {
    scene.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(scene);
    return { minY: box.min.y, maxY: box.max.y };
  }, [scene]);

  const CLIP_OFFSET = 0.35; // tweak (meters) how much above the camera we cut when outside
  const CEILING_MARGIN = 0.1; // how close to the roof we consider "outside"

  // Make plane follow the camera height
  useFrame(() => {
    if (camera.position.y >= bounds.maxY - CEILING_MARGIN) {
      ceilingPlane.constant = camera.position.y + CLIP_OFFSET;
    } else {
      ceilingPlane.constant = 1e6;
    }
  });

  // One-time traverse: enforce FrontSide and attach clipping plane
  useEffect(() => {
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

// Component to render a single 3D item model
function ItemModel({ item }) {
  const { scene } = useGLTF(item.modelPath);
  const scale = item.scale || 1.0;

  // Clone the scene to avoid modifying the original
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  return (
    <primitive
      object={clonedScene}
      position={[item.x, item.y, item.z]}
      scale={[scale, scale, scale]}
    />
  );
}

export default function Map3D() {
  const { labId } = useParams();
  const [lab, setLab] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch lab details
        const labData = await getLabById(labId);
        setLab(labData);

        // Fetch items for this lab that have 3D models
        const itemsData = await getEquipment({ labId });
        // Filter items that have model paths and coordinates
        const itemsWithModels = itemsData.filter(
          (item) =>
            item.modelPath &&
            item.x !== null &&
            item.x !== undefined &&
            item.y !== null &&
            item.y !== undefined &&
            item.z !== null &&
            item.z !== undefined
        );
        setItems(itemsWithModels);

        // Preload all item models
        itemsWithModels.forEach((item) => {
          if (item.modelPath) {
            useGLTF.preload(item.modelPath);
          }
        });
      } catch (err) {
        console.error('Failed to load lab or items:', err);
        setError(err.message || 'Failed to load lab. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [labId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !lab) {
    return (
      <Box>
        <Typography variant="h2">{error || 'Lab not found'}</Typography>
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
        <Box>
          <Typography variant="h1">{lab.name}</Typography>
          {items.length > 0 && (
            <Typography variant="body2" color="text.secondary">
              {items.length} 3D {items.length === 1 ? 'item' : 'items'} in this lab
            </Typography>
          )}
        </Box>
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
              {/* Lab Model */}
              <LabModel key={lab.modelPath} path={lab.modelPath} />

              {/* Item Models */}
              {items.map((item) => (
                <ItemModel key={item.id} item={item} />
              ))}
            </Bounds>
            <Environment preset="city" />
          </Suspense>
          <OrbitControls makeDefault enablePan enableZoom enableRotate />
        </Canvas>
      </div>
    </Box>
  );
}
