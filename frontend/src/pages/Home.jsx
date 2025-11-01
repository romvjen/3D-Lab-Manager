import { Link } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from "@mui/material";
import {
  Inventory as InventoryIcon,
  ViewInAr as ViewInArIcon,
  QrCodeScanner as QrCodeScannerIcon,
  FiberNew as FiberNewIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";

/**
 * Home Page Component
 * Landing page with hero section, quick navigation cards, and changelog
 * University-compliant design with clear hierarchy and accessibility
 */
function Home() {
  // Quick access cards configuration
  const quickAccessCards = [
    {
      title: "Items",
      description:
        "Search and browse lab equipment inventory. Filter by category, status, and location.",
      icon: <InventoryIcon sx={{ fontSize: 40, color: "primary.main" }} />,
      path: "/items",
      color: "primary.main",
    },
    {
      title: "3D Map",
      description:
        "Visualize lab layout and locate equipment in 3D space. Perfect for navigation.",
      icon: <ViewInArIcon sx={{ fontSize: 40, color: "secondary.main" }} />,
      path: "/map3d",
      color: "secondary.main",
    },
    {
      title: "Scan",
      description:
        "Use your camera to scan QR codes on equipment for instant access to details.",
      icon: <QrCodeScannerIcon sx={{ fontSize: 40, color: "success.main" }} />,
      path: "/scan",
      color: "success.main",
    },
  ];

  // Changelog data for "What's New" section
  const changelog = [
    {
      version: "Sprint 2.0",
      date: "October 2025",
      items: [
        "Initial release of 3D Lab Manager",
        "3D Map Viewer",
        "Complete equipment inventory system",
        "QR code scanning functionality",
        "Responsive design for mobile and desktop",
        "Full accessibility compliance (WCAG 2.1 AA)",
      ],
    },
  ];

  return (
    <Box sx={{ py: 2 }}>
      {/* Hero Section */}
      <Box
        sx={{
          textAlign: "center",
          py: { xs: 3, md: 4 },
          px: 2,
          backgroundColor: "background.paper",
          borderRadius: 3,
          mb: 3,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontSize: { xs: "2rem", md: "3rem" },
            fontWeight: 700,
            color: "primary.main",
            mb: 2,
            letterSpacing: "-0.025em",
          }}
        >
          3D Lab Manager
        </Typography>

        <Chip
          label="Sprint 1"
          color="primary"
          variant="outlined"
          sx={{ mb: 3 }}
        />

        <Typography
          variant="h2"
          component="p"
          sx={{
            fontSize: { xs: "1.125rem", md: "1.25rem" },
            color: "text.secondary",
            fontWeight: 400,
            maxWidth: "600px",
            mx: "auto",
            lineHeight: 1.6,
          }}
        >
          Browse equipment, locate items, and report issues quickly in the
          Senior Design Engineering Lab.
        </Typography>
      </Box>

      {/* Quick Access Cards */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h2"
          component="h2"
          sx={{
            fontSize: "1.5rem",
            fontWeight: 600,
            color: "text.primary",
            mb: 2,
            textAlign: { xs: "center", md: "left" },
          }}
        >
          Quick Access
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
            alignItems: "stretch",
          }}
        >
          {quickAccessCards.map((card) => (
            <Box key={card.title} sx={{ flex: 1, display: "flex" }}>
              <Card
                sx={{
                  height: "100%",
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 6,
                  },
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <CardContent
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                    p: 2.5,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    {card.icon}
                    <Typography
                      variant="h3"
                      component="h3"
                      sx={{
                        fontSize: "1.25rem",
                        fontWeight: 600,
                        color: "text.primary",
                      }}
                    >
                      {card.title}
                    </Typography>
                  </Box>

                  <Typography
                    variant="body1"
                    sx={{
                      color: "text.secondary",
                      lineHeight: 1.6,
                      flex: 1,
                      minHeight: "3em",
                    }}
                  >
                    {card.description}
                  </Typography>
                </CardContent>

                <CardActions sx={{ p: 2.5, pt: 0 }}>
                  <Button
                    component={Link}
                    to={card.path}
                    variant="contained"
                    fullWidth
                    sx={{
                      backgroundColor: card.color,
                      "&:hover": {
                        backgroundColor: card.color,
                        opacity: 0.9,
                      },
                    }}
                  >
                    Go to {card.title}
                  </Button>
                </CardActions>
              </Card>
            </Box>
          ))}
        </Box>
      </Box>

      {/* What's New Section */}
      <Box>
        <Typography
          variant="h2"
          component="h2"
          sx={{
            fontSize: "1.5rem",
            fontWeight: 600,
            color: "text.primary",
            mb: 3,
            textAlign: { xs: "center", md: "left" },
          }}
        >
          What's New
        </Typography>

        <Card
          sx={{
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            {changelog.map((release) => (
              <Box
                key={release.version}
                sx={{ mb: 3, "&:last-child": { mb: 0 } }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    mb: 2,
                  }}
                >
                  <FiberNewIcon
                    sx={{
                      color: "primary.main",
                      fontSize: "1.5rem",
                    }}
                  />
                  <Typography
                    variant="h3"
                    component="h3"
                    sx={{
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      color: "text.primary",
                    }}
                  >
                    {release.version}
                  </Typography>
                  <Chip
                    label={release.date}
                    size="small"
                    variant="outlined"
                    sx={{ ml: "auto" }}
                  />
                </Box>

                <List dense sx={{ pl: 2 }}>
                  {release.items.map((item, index) => (
                    <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}>
                        <CheckCircleIcon
                          sx={{
                            fontSize: "1rem",
                            color: "success.main",
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={item}
                        slotProps={{
                          primary: {
                            variant: "body2",
                            color: "text.secondary",
                          },
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

export default Home;
