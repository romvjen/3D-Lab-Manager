import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  Snackbar,
  Chip,
  Stack,
} from "@mui/material";
import {
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  FilterList as FilterListIcon,
} from "@mui/icons-material";

// API and constants
import { itemsApi } from "../lib/api.js";
import { ITEM_CATEGORIES, ITEM_STATUSES } from "../shared/types.js";

// Components
import SearchBar from "../components/SearchBar.jsx";
import ItemCard from "../components/ItemCard.jsx";
import LoadingSkeleton from "../components/LoadingSkeleton.jsx";
import EmptyState from "../components/EmptyState.jsx";

/**
 * Items Page Component
 * Complete inventory management interface with search, filters, and grid/list views
 * Implements URL state persistence and proper loading/error states
 */
function Items() {
  const [searchParams, setSearchParams] = useSearchParams();

  // State management
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [categoryFilter, setCategoryFilter] = useState(
    searchParams.get("category") || "all"
  );
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "all"
  );
  const [viewMode, setViewMode] = useState("grid");

  // Debounced search implementation
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch items function
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {
        q: debouncedQuery,
        category: categoryFilter,
        status: statusFilter,
      };

      const data = await itemsApi.getItems(filters);
      setItems(data);
    } catch (err) {
      console.error("Failed to fetch items:", err);
      setError(err.message || "Failed to load items. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, categoryFilter, statusFilter]);

  // Update URL parameters when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (debouncedQuery) params.set("q", debouncedQuery);
    if (categoryFilter && categoryFilter !== "all")
      params.set("category", categoryFilter);
    if (statusFilter && statusFilter !== "all")
      params.set("status", statusFilter);

    setSearchParams(params);
  }, [debouncedQuery, categoryFilter, statusFilter, setSearchParams]);

  // Fetch items when filters change
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Filter handlers
  const handleSearchChange = (value) => {
    setSearchQuery(value);
  };

  const handleSearchClear = () => {
    setSearchQuery("");
  };

  const handleCategoryChange = (event) => {
    setCategoryFilter(event.target.value);
  };

  const handleStatusChange = (_, newStatus) => {
    if (newStatus !== null) {
      setStatusFilter(newStatus);
    }
  };

  const handleViewModeChange = (_, newViewMode) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setStatusFilter("all");
  };

  const handleRetry = () => {
    fetchItems();
  };

  const handleCloseError = () => {
    setError(null);
  };

  // Get active filter count for display
  const activeFilterCount = [
    debouncedQuery,
    categoryFilter !== "all" ? categoryFilter : null,
    statusFilter !== "all" ? statusFilter : null,
  ].filter(Boolean).length;

  // Format status for display
  const formatStatus = (status) => {
    return status.replace("_", " ").toUpperCase();
  };

  // Get status color for chips (same as ItemCard)
  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "success";
      case "checked_out":
        return "warning";
      case "broken":
        return "error";
      default:
        return "default";
    }
  };

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
          Lab Inventory
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "text.secondary",
            fontSize: "1rem",
          }}
        >
          Search and manage equipment in the Senior Design Engineering Lab
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Box sx={{ mb: 4, width: "100%" }}>
        {/* Search Bar */}
        <Box sx={{ mb: 3 }}>
          <SearchBar
            value={searchQuery}
            onChange={handleSearchChange}
            onClear={handleSearchClear}
            disabled={loading}
          />
        </Box>

        {/* Filters and Controls */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
            alignItems: { xs: "stretch", md: "center" },
            justifyContent: "space-between",
            width: "100%",
            maxWidth: "100%",
          }}
        >
          {/* Filter Controls */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              flex: 1,
            }}
          >
            {/* Category Filter */}
            <FormControl
              size="medium"
              sx={{ minWidth: 140 }}
              disabled={loading}
            >
              <InputLabel id="category-filter-label">Category</InputLabel>
              <Select
                labelId="category-filter-label"
                value={categoryFilter}
                onChange={handleCategoryChange}
                label="Category"
              >
                <MenuItem value="all">All Categories</MenuItem>
                {ITEM_CATEGORIES.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Status Filter */}
            <ToggleButtonGroup
              value={statusFilter}
              exclusive
              onChange={handleStatusChange}
              disabled={loading}
              sx={{
                "& .MuiToggleButton-root": {
                  px: 2,
                  py: 1,
                  border: "1px solid",
                  borderColor: "divider",
                  "&.Mui-selected": {
                    backgroundColor: "primary.main",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "primary.dark",
                    },
                  },
                },
              }}
            >
              <ToggleButton value="all" aria-label="all statuses">
                All
              </ToggleButton>
              {ITEM_STATUSES.map((status) => (
                <ToggleButton
                  key={status}
                  value={status}
                  aria-label={`filter by ${status}`}
                >
                  {formatStatus(status)}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          {/* View Mode Toggle */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            size="medium"
            disabled={loading}
          >
            <ToggleButton value="grid" aria-label="grid view">
              <ViewModuleIcon />
            </ToggleButton>
            <ToggleButton value="list" aria-label="list view">
              <ViewListIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <Box sx={{ mt: 2 }}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
            >
              <FilterListIcon
                sx={{ color: "text.secondary", fontSize: "1.25rem" }}
              />
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", mr: 1 }}
              >
                Active filters:
              </Typography>

              {debouncedQuery && (
                <Chip
                  label={`Search: "${debouncedQuery}"`}
                  size="small"
                  onDelete={handleSearchClear}
                  color="primary"
                  variant="outlined"
                />
              )}

              {categoryFilter !== "all" && (
                <Chip
                  label={`Category: ${categoryFilter}`}
                  size="small"
                  onDelete={() => setCategoryFilter("all")}
                  color="primary"
                  variant="outlined"
                />
              )}

              {statusFilter !== "all" && (
                <Chip
                  label={`Status: ${formatStatus(statusFilter)}`}
                  size="small"
                  onDelete={() => setStatusFilter("all")}
                  color="primary"
                  variant="outlined"
                />
              )}

              <Chip
                label="Clear all"
                size="small"
                onClick={clearAllFilters}
                color="secondary"
                variant="outlined"
                sx={{ ml: 1 }}
              />
            </Stack>
          </Box>
        )}
      </Box>

      {/* Results Section */}
      <Box
        sx={{
          width: viewMode === "list" ? "100vw" : "100%",
          ml: viewMode === "list" ? { xs: -2, sm: -3, md: -4 } : 0,
          px: viewMode === "list" ? { xs: 2, sm: 3, md: 4 } : 0,
          overflow: "hidden",
          flex: "1 1 auto",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Results Count */}
        {!loading && !error && (
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              mb: 2,
              fontSize: "0.875rem",
              flexShrink: 0,
            }}
          >
            {items.length === 0
              ? "No items found"
              : `${items.length} item${items.length === 1 ? "" : "s"} found`}
          </Typography>
        )}

        {/* Loading State */}
        {loading && (
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <LoadingSkeleton count={6} />
          </Box>
        )}

        {/* Error State */}
        {error && !loading && (
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <EmptyState
              type="error"
              description={error}
              onRetry={handleRetry}
              onClear={activeFilterCount > 0 ? clearAllFilters : null}
            />
          </Box>
        )}

        {/* Empty State */}
        {!loading && !error && items.length === 0 && (
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <EmptyState
              type={activeFilterCount > 0 ? "empty" : "noData"}
              onClear={activeFilterCount > 0 ? clearAllFilters : null}
            />
          </Box>
        )}

        {/* Items Grid / List */}
        {!loading &&
          !error &&
          items.length > 0 &&
          (viewMode === "grid" ? (
            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(3, 1fr)",
                  lg: "repeat(4, 1fr)",
                  xl: "repeat(6, 1fr)",
                },
                gap: 2,
                width: "100%",
                alignItems: "stretch",
                overflowY: "auto",
              }}
            >
              {items.map((item) => (
                <Box key={item.id} sx={{ display: "flex" }}>
                  <ItemCard item={item} />
                </Box>
              ))}
            </Box>
          ) : (
            // List view: fill height and allow scrolling
            <Box
              sx={{ flex: 1, minHeight: 0, display: "flex", overflowY: "auto" }}
            >
              <Stack spacing={1.5} sx={{ width: "100%", flex: 1 }}>
                {items.map((item) => (
                  <Box
                    component={Link}
                    to={`/item/${item.id}`}
                    key={item.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      p: 1.5,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                      bgcolor: "background.paper",
                      width: "100%",
                    }}
                  >
                    {/* optional thumbnail placeholder; replace with item.image if available */}
                    <Box
                      sx={{
                        flex: "0 0 56px",
                        height: 56,
                        borderRadius: 1,
                        bgcolor: "action.hover",
                      }}
                    />

                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="subtitle1" noWrap>
                        {item.name || item.title || `Item ${item.id}`}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {item.category || "Uncategorized"}
                      </Typography>
                    </Box>

                    {item.status && (
                      <Chip
                        label={formatStatus(item.status)}
                        color={getStatusColor(item.status)}
                        size="small"
                      />
                    )}
                  </Box>
                ))}
              </Stack>
            </Box>
          ))}
      </Box>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseError} severity="error" variant="filled">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Items;
