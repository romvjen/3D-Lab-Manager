import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  CardMedia,
  Chip,
  Grid,
  Breadcrumbs,
  Link,
  Alert,
  Snackbar,
  Skeleton,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  OpenInNew as OpenInNewIcon,
  ReportProblem as ReportProblemIcon,
  LocationOn as LocationIcon,
  QrCode as QrCodeIcon,
  Category as CategoryIcon,
  Info as InfoIcon,
  ShoppingCart as ShoppingCartIcon,
  History as HistoryIcon,
} from "@mui/icons-material";

// API and components
//import { itemsApi } from "../lib/api";
import { getEquipmentById } from "../lib/supabaseItems.js";
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

        const data = await getEquipmentById(id);

        if (!data) {
          setItem(null);
          setError("Item not found in database.");
          return;
        }

        setItem(data);
      } catch (err) {
        console.error("Failed to fetch item:", err);
        setError("Failed to load item details from database.");
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
    <Box sx={{ maxWidth: "1400px", mx: "auto" }}>
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

      {/* Main Content Card */}
      <Card
        sx={{
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          boxShadow: 3,
        }}
      >
        <Grid container>
          {/* Left Column - Image */}
          <Grid item xs={12} lg={5}>
            <Box
              sx={{
                position: "relative",
                height: { xs: "400px", lg: "100%" },
                minHeight: { lg: "600px" },
                backgroundColor: "grey.100",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CardMedia
                component="img"
                image={item.thumbnailUrl}
                alt={`${item.name} image`}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  position: "absolute",
                  top: 0,
                  left: 0,
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              {/* Fallback content */}
              <Box
                sx={{
                  textAlign: "center",
                  color: "text.secondary",
                  p: 4,
                  zIndex: 1,
                }}
              >
                <Box sx={{ fontSize: "4rem", mb: 2 }}>📦</Box>
                <Typography variant="h6" color="text.secondary">
                  {item.category}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Right Column - Details and Actions */}
          <Grid item xs={12} lg={7}>
            <Box sx={{ p: { xs: 3, md: 4, lg: 5 } }}>
              {/* Header Section */}
              <Box sx={{ mb: 4 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 2,
                    mb: 2,
                  }}
                >
                  <Typography
                    variant="h1"
                    component="h1"
                    sx={{
                      fontSize: { xs: "1.75rem", md: "2.25rem" },
                      fontWeight: 700,
                      color: "text.primary",
                      lineHeight: 1.2,
                    }}
                  >
                    {item.name}
                  </Typography>
                  <Chip
                    label={statusConfig.label}
                    color={statusConfig.color}
                    variant="filled"
                    size="medium"
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      height: 32,
                      flexShrink: 0,
                    }}
                  />
                </Box>

                <Typography
                  variant="body1"
                  sx={{
                    color: "text.secondary",
                    fontFamily: "monospace",
                    fontSize: "0.9375rem",
                    backgroundColor: "grey.50",
                    display: "inline-block",
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                  }}
                >
                  ID: {item.id}
                </Typography>
              </Box>

              {/* Information Grid */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 3,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <InfoIcon
                    sx={{ fontSize: "1.25rem", color: "primary.main" }}
                  />
                  Item Information
                </Typography>

                <Grid container spacing={3}>
                  {/* Category */}
                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        p: 2.5,
                        borderRadius: 2,
                        backgroundColor: "grey.50",
                        border: "1px solid",
                        borderColor: "grey.200",
                        height: "100%",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1.5,
                        }}
                      >
                        <CategoryIcon
                          sx={{ fontSize: "1.125rem", color: "primary.main" }}
                        />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontWeight={500}
                        >
                          Category
                        </Typography>
                      </Box>
                      <Chip
                        label={item.category}
                        variant="filled"
                        size="medium"
                        sx={{
                          fontWeight: 500,
                          backgroundColor: "primary.main",
                          color: "white",
                        }}
                      />
                    </Box>
                  </Grid>

                  {/* Status */}
                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        p: 2.5,
                        borderRadius: 2,
                        backgroundColor: "grey.50",
                        border: "1px solid",
                        borderColor: "grey.200",
                        height: "100%",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1.5,
                        }}
                      >
                        <Box
                          sx={{
                            width: 14,
                            height: 14,
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
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontWeight={500}
                        >
                          Status
                        </Typography>
                      </Box>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 600, fontSize: "1.125rem" }}
                      >
                        {statusConfig.label}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Location */}
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        p: 2.5,
                        borderRadius: 2,
                        backgroundColor: "grey.50",
                        border: "1px solid",
                        borderColor: "grey.200",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1.5,
                        }}
                      >
                        <LocationIcon
                          sx={{ fontSize: "1.125rem", color: "primary.main" }}
                        />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontWeight={500}
                        >
                          Location
                        </Typography>
                      </Box>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 600, fontSize: "1.125rem" }}
                      >
                        {item.locationPath}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* QR Code Section */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <QrCodeIcon
                    sx={{ fontSize: "1.25rem", color: "primary.main" }}
                  />
                  QR Code
                </Typography>

                <Box
                  sx={{
                    backgroundColor: "grey.50",
                    border: "2px dashed",
                    borderColor: "primary.main",
                    borderRadius: 2,
                    p: 3,
                    textAlign: "center",
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      fontFamily: "monospace",
                      color: "primary.main",
                      mb: 0.5,
                    }}
                  >
                    {item.id}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Scan this item's QR code label
                  </Typography>
                </Box>
              </Box>

              {/* Checkout Log Section */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <HistoryIcon
                    sx={{ fontSize: "1.25rem", color: "primary.main" }}
                  />
                  Checkout History
                </Typography>

                <Box
                  sx={{
                    backgroundColor: "grey.50",
                    border: "1px solid",
                    borderColor: "grey.200",
                    borderRadius: 2,
                    p: 3,
                  }}
                >
                  {item.status === "checked_out" ? (
                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1.5 }}
                      >
                        <strong>Current Status:</strong> Checked Out
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        This item is currently checked out. Checkout history details will be available when the checkout system is fully implemented.
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: "center", py: 2 }}>
                      <HistoryIcon
                        sx={{ fontSize: "2.5rem", color: "text.disabled", mb: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {item.status === "available"
                          ? "This item is currently available. No active checkouts."
                          : "Checkout history will be displayed here when available."}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Amazon Link (if available) */}
              {item.amazonLink && (
                <Box sx={{ mb: 3 }}>
                  <Button
                    component="a"
                    href={item.amazonLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="contained"
                    size="large"
                    startIcon={<ShoppingCartIcon />}
                    fullWidth
                    sx={{
                      py: 1.75,
                      fontWeight: 600,
                      fontSize: "1rem",
                      backgroundColor: "#FF9900",
                      color: "white",
                      boxShadow: 2,
                      "&:hover": {
                        backgroundColor: "#EC7211",
                        boxShadow: 4,
                      },
                    }}
                  >
                    View on Amazon
                  </Button>
                </Box>
              )}

              {/* Action Buttons */}
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flexDirection: { xs: "column", sm: "row" },
                }}
              >
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<OpenInNewIcon />}
                  onClick={handleOpen3D}
                  fullWidth
                  sx={{
                    py: 1.75,
                    fontWeight: 600,
                    fontSize: "1rem",
                    boxShadow: 2,
                    "&:hover": {
                      boxShadow: 4,
                    },
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
                    py: 1.75,
                    fontWeight: 600,
                    fontSize: "1rem",
                    borderWidth: 2,
                    "&:hover": {
                      borderWidth: 2,
                    },
                  }}
                >
                  Report Issue
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Card>

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
