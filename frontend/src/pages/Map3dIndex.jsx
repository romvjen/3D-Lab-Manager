import React, { useState, useEffect, useCallback } from "react";
import LabCard from "../components/LabCard";
import { LABS } from "../config/labs";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
} from "@mui/material";

export default function Maps() {
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontSize: { xs: "1.75rem", md: "2.25rem" },
            fontWeight: 700,
            color: "primary.main",
            mb: 1,
          }}
        >
          3D Maps
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "text.secondary",
            fontSize: "1rem",
          }}
        >
          Choose a lab to visualize the layout and locate equipment in 3D space
        </Typography>
      </Box>

      {/*Display Grid*/}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
            xl: "repeat(6, 1fr)",
          },
          gap: 2,
        }}
      >
        {LABS.map((lab) => (
          <Box key={lab.id} sx={{ display: "flex" }}>
            <LabCard lab={lab} />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
