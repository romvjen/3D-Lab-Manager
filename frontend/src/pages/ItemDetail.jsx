import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Grid,
  Breadcrumbs,
  Link,
  Alert,
  Snackbar,
  Skeleton,
  IconButton,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  OpenInNew as OpenInNewIcon,
  ReportProblem as ReportProblemIcon,
  LocationOn as LocationIcon,
  QrCode as QrCodeIcon,
  Category as CategoryIcon,
  Info as InfoIcon,
} from "@mui/icons-material";

// API and components
import { itemsApi } from "../lib/api";
import IssueModal from "../components/IssueModal";
import EmptyState from "../components/EmptyState";

/**
 * ItemDetail Page Component
 * Shows comprehensive item information with actions
 * Includes issue reporting modal and 3D map integration
 */
function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // State management
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // Fetch item data
  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const data = await itemsApi.getItem(id);
        setItem(data);
      } catch (err) {
        console.error("Failed to fetch item:", err);
        setError(
          err.message || "Failed to load item details. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  // Navigation handlers
  const handleBack = () => {
    // Preserve search state when going back to items
    const itemsPath = "/items";
    const query = searchParams.toString();
    navigate(query ? `${itemsPath}?${query}` : itemsPath);
  };

  const handleOpen3D = () => {
    // Navigate to 3D map with item parameter
    navigate(`/map3d?item=${id}`);

    // Attempt to call global 3D function if it exists
    if (window.flyToItem && typeof window.flyToItem === "function") {
      try {
        window.flyToItem(id);
      } catch (error) {
        console.log("3D integration not available:", error);
      }
    }
  };

  // Modal handlers
  const handleOpenIssueModal = () => {
    setIssueModalOpen(true);
  };

  const handleCloseIssueModal = () => {
    setIssueModalOpen(false);
  };

  const handleIssueSuccess = (notification) => {
    setToast({
      open: true,
      message: notification.message,
      severity: notification.type || "success",
    });
  };

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };

  // Retry handler
  const handleRetry = () => {
    window.location.reload();
  };

  // Status chip configuration
  const getStatusConfig = (status) => {
    switch (status) {
      case "available":
        return { color: "success", label: "AVAILABLE" };
      case "checked_out":
        return { color: "warning", label: "CHECKED OUT" };
      case "broken":
        return { color: "error", label: "BROKEN" };
      default:
        return { color: "default", label: status?.toUpperCase() || "UNKNOWN" };
    }
  };

  // Loading state
  if (loading) {
    return (
      <Box>
        {/* Breadcrumb skeleton */}
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" width={200} height={24} />
        </Box>

        {/* Header skeleton */}
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width={300} height={40} sx={{ mb: 1 }} />
          <Skeleton
            variant="rectangular"
            width={100}
            height={24}
            sx={{ borderRadius: 10 }}
          />
        </Box>

        {/* Content skeleton */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Skeleton
              variant="rectangular"
              width="100%"
              height={300}
              sx={{ borderRadius: 2 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="text" width="100%" height={30} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="80%" height={24} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="60%" height={24} sx={{ mb: 3 }} />
            <Skeleton
              variant="rectangular"
              width={150}
              height={40}
              sx={{ borderRadius: 1, mb: 2 }}
            />
            <Skeleton
              variant="rectangular"
              width={120}
              height={36}
              sx={{ borderRadius: 1 }}
            />
          </Grid>
        </Grid>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <EmptyState
        type="error"
        title="Failed to load item"
        description={error}
        onRetry={handleRetry}
      />
    );
  }

  // Item not found
  if (!item) {
    return (
      <EmptyState
        type="noData"
        title="Item not found"
        description={`No item found with ID: ${id}`}
      />
    );
  }

  const statusConfig = getStatusConfig(item.status);

  return (
    <Box>
      {/* Breadcrumbs */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            component="button"
            variant="body2"
            onClick={handleBack}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              textDecoration: "none",
              color: "primary.main",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            <ArrowBackIcon sx={{ fontSize: "1rem" }} />
            Back to Items
          </Link>
          <Typography variant="body2" color="text.secondary">
            {item.name}
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 2 }}>
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: { xs: "1.5rem", md: "2rem" },
              fontWeight: 700,
              color: "text.primary",
              flex: 1,
            }}
          >
            {item.name}
          </Typography>
          <Chip
            label={statusConfig.label}
            color={statusConfig.color}
            variant="filled"
            sx={{ fontWeight: 600 }}
          />
        </Box>

        {/* Item ID */}
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            fontFamily: "monospace",
            fontSize: "0.875rem",
          }}
        >
          ID: {item.id}
        </Typography>
      </Box>

      {/* Main Content */}
      <Grid container spacing={4}>
        {/* Left Column - Image and Actions */}
        <Grid item xs={12} md={6}>
          {/* Item Image */}
          <Card sx={{ mb: 3, border: "1px solid", borderColor: "divider" }}>
            <CardMedia
              component="img"
              height="300"
              image={item.thumbnailUrl}
              alt={`${item.name} image`}
              sx={{
                objectFit: "cover",
                backgroundColor: "grey.100",
              }}
              onError={(e) => {
                e.target.src = `https://via.placeholder.com/400x300/2563eb/ffffff?text=${encodeURIComponent(
                  item.name
                )}`;
              }}
            />
          </Card>

          {/* Action Buttons */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<OpenInNewIcon />}
              onClick={handleOpen3D}
              fullWidth
              sx={{
                py: 1.5,
                fontWeight: 600,
              }}
            >
              Open in 3D Map
            </Button>

            <Button
              variant="outlined"
              size="large"
              startIcon={<ReportProblemIcon />}
              onClick={handleOpenIssueModal}
              color="warning"
              fullWidth
              sx={{
                py: 1.5,
                fontWeight: 600,
              }}
            >
              Report Issue
            </Button>
          </Box>
        </Grid>

        {/* Right Column - Details */}
        <Grid item xs={12} md={6}>
          {/* Basic Information */}
          <Card sx={{ mb: 3, border: "1px solid", borderColor: "divider" }}>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <InfoIcon sx={{ fontSize: "1.25rem" }} />
                Item Information
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {/* Category */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CategoryIcon
                    sx={{ fontSize: "1.25rem", color: "text.secondary" }}
                  />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Category
                    </Typography>
                    <Chip
                      label={item.category}
                      variant="outlined"
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </Box>

                {/* Location */}
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                  <LocationIcon
                    sx={{
                      fontSize: "1.25rem",
                      color: "text.secondary",
                      mt: 0.5,
                    }}
                  />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Location
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {item.locationPath}
                    </Typography>
                  </Box>
                </Box>

                {/* Status */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: "1.25rem",
                      height: "1.25rem",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        backgroundColor:
                          statusConfig.color === "success"
                            ? "success.main"
                            : statusConfig.color === "warning"
                            ? "warning.main"
                            : statusConfig.color === "error"
                            ? "error.main"
                            : "grey.400",
                      }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {statusConfig.label}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* QR Code Information */}
          <Card sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <QrCodeIcon sx={{ fontSize: "1.25rem" }} />
                QR Code Information
              </Typography>

              <Typography variant="body2" color="text.secondary" paragraph>
                This item can be identified by scanning its QR code label.
              </Typography>

              <Box
                sx={{
                  backgroundColor: "grey.50",
                  border: "2px dashed",
                  borderColor: "grey.300",
                  borderRadius: 1,
                  p: 2,
                  textAlign: "center",
                  fontFamily: "monospace",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {item.id}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  QR Code Data
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Issue Reporting Modal */}
      <IssueModal
        open={issueModalOpen}
        onClose={handleCloseIssueModal}
        onSuccess={handleIssueSuccess}
        itemId={item.id}
        itemName={item.name}
      />

      {/* Success/Error Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={6000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseToast}
          severity={toast.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ItemDetail;
