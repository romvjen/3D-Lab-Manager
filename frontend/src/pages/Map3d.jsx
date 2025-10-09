import React, { Suspense, useMemo } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
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
    <Html center style={{ fontFamily: "system-ui", fontSize: 14 }}>
      {Math.round(progress)}%
    </Html>
  );
}

function Model({ path }) {
  useGLTF.preload(path); // Preload and load specific file for this lab
  const { scene } = useGLTF(path);
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
        <Button component={RouterLink} to="/map3d">
          Go Back To All Labs
        </Button>
      </Stack>
      {/* Camera View */}
      <div style={{ height: "80vh", width: "100%" }}>
        <Canvas camera={{ position: [10, 10, 10], fov: 30 }}>
          <ambientLight />
          <directionalLight position={[5, 5, 5]} intensity={0.9} />
          <Suspense fallback={<Loader />}>
            <Bounds fit clip observe>
              <Model path={lab.modelPath} />
            </Bounds>
            <Environment preset="city" />
          </Suspense>
          <OrbitControls />
        </Canvas>
      </div>
    </Box>
  );
}
