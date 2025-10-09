import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Box,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Inventory as InventoryIcon,
  ViewInAr as ViewInArIcon,
  QrCodeScanner as QrCodeScannerIcon,
  Home as HomeIcon,
} from "@mui/icons-material";

/**
 * Top Navigation Component
 * University-compliant navigation bar with responsive design
 * Includes UTA branding and accessibility features
 */
function TopNav() {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);

  // Navigation items configuration
  const navItems = [
    { path: "/", label: "Home", icon: <HomeIcon /> },
    { path: "/items", label: "Items", icon: <InventoryIcon /> },
    { path: "/map3d", label: "3D Map", icon: <ViewInArIcon /> },
    { path: "/scan", label: "Scan", icon: <QrCodeScannerIcon /> },
  ];

  // Get current tab value for controlled tabs
  const getCurrentTabValue = () => {
    const currentPath = location.pathname;
    const matchingItem = navItems.find(
      (item) =>
        item.path === currentPath ||
        (item.path === "/items" && currentPath.startsWith("/item/"))
    );
    return matchingItem ? matchingItem.path : false;
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  // Mobile Menu Component
  const MobileMenu = () => (
    <Menu
      anchorEl={mobileMenuAnchor}
      open={Boolean(mobileMenuAnchor)}
      onClose={handleMobileMenuClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
    >
      {navItems.map((item) => (
        <MenuItem
          key={item.path}
          component={Link}
          to={item.path}
          onClick={handleMobileMenuClose}
          selected={getCurrentTabValue() === item.path}
          sx={{ gap: 1 }}
          aria-label={`Navigate to ${item.label}`}
        >
          {item.icon}
          {item.label}
        </MenuItem>
      ))}
    </Menu>
  );

  return (
    <>
      {/* Skip Navigation Link for Accessibility */}
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: "absolute",
          top: -50,
          left: 10,
          zIndex: 9999,
          backgroundColor: "primary.main",
          color: "white",
          padding: "8px 16px",
          textDecoration: "none",
          borderRadius: 1,
          fontWeight: 600,
          "&:focus": {
            top: 10,
          },
        }}
      >
        Skip to main content
      </Box>

      <AppBar
        position="sticky"
        elevation={1}
        sx={{
          backgroundColor: "primary.main",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Toolbar
          sx={{
            justifyContent: "space-between",
            px: { xs: 2, md: 3 },
          }}
        >
          {/* University Wordmark and App Title */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* UTA Logo placeholder - In production, use official university logo */}
            <Box
              component={Link}
              to="/"
              sx={{
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
                color: "inherit",
                "&:focus-visible": {
                  outline: "2px solid white",
                  outlineOffset: "2px",
                  borderRadius: 1,
                },
              }}
            >
              <Typography
                variant="h6"
                component="span"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "1.1rem", md: "1.25rem" },
                  color: "white",
                  letterSpacing: "-0.025em",
                }}
              >
                UTA
              </Typography>
            </Box>

            {/* App Title */}
            <Typography
              variant="h6"
              component="h1"
              sx={{
                fontWeight: 600,
                fontSize: { xs: "1rem", md: "1.125rem" },
                color: "white",
                display: { xs: "none", sm: "block" },
              }}
            >
              3D Lab Manager
            </Typography>
          </Box>

          {/* Navigation */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {/* Desktop Navigation */}
            {!isMobile ? (
              <Tabs
                value={getCurrentTabValue()}
                textColor="inherit"
                indicatorColor="secondary"
                sx={{
                  "& .MuiTab-root": {
                    color: "rgba(255, 255, 255, 0.8)",
                    fontWeight: 500,
                    minHeight: 48,
                    "&.Mui-selected": {
                      color: "white",
                    },
                    "&:focus-visible": {
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                    },
                  },
                  "& .MuiTabs-indicator": {
                    backgroundColor: "white",
                    height: 3,
                  },
                }}
              >
                {navItems.map((item) => (
                  <Tab
                    key={item.path}
                    label={item.label}
                    value={item.path}
                    component={Link}
                    to={item.path}
                    icon={item.icon}
                    iconPosition="start"
                    sx={{ gap: 1 }}
                    aria-label={`Navigate to ${item.label}`}
                  />
                ))}
              </Tabs>
            ) : (
              // Mobile Navigation
              <>
                <IconButton
                  edge="end"
                  color="inherit"
                  aria-label="Open navigation menu"
                  onClick={handleMobileMenuOpen}
                  sx={{
                    color: "white",
                    "&:focus-visible": {
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                    },
                  }}
                >
                  <MenuIcon />
                </IconButton>
                <MobileMenu />
              </>
            )}
          </Box>
        </Toolbar>

        {/* Sprint indicator for development */}
        {import.meta.env.DEV && (
          <Box
            sx={{
              backgroundColor: "warning.main",
              color: "warning.contrastText",
              py: 0.5,
              px: 2,
              textAlign: "center",
              fontSize: "0.75rem",
              fontWeight: 500,
            }}
          >
            Sprint 2 Development Build
          </Box>
        )}
      </AppBar>
    </>
  );
}

export default TopNav;
