import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';

// Import styles
// import './styles/globals.css';

// Initialize MSW in development
if (import.meta.env.DEV) {
  import('./mocks/browser.js');
}

// Components
import TopNav from './components/TopNav.jsx';
import Footer from './components/Footer.jsx';

// Pages
import Home from './pages/Home.jsx';
import Items from './pages/Items.jsx';
import ItemDetail from './pages/ItemDetail.jsx';


// Material-UI theme configuration matching university standards
const theme = createTheme({
  palette: {
    primary: {
      main: '#1e3a8a', // UTA Navy
      light: '#2563eb', // UTA Blue
      dark: '#1e40af',
    },
    secondary: {
      main: '#64748b', // Neutral
      light: '#94a3b8',
      dark: '#475569',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
  },
  typography: {
    fontFamily: ['Inter', 'Roboto', 'system-ui', 'sans-serif'].join(','),
    h1: {
      fontSize: '2.25rem',
      fontWeight: 600,
      marginBottom: '1rem',
    },
    h2: {
      fontSize: '1.875rem',
      fontWeight: 600,
      marginBottom: '0.75rem',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      marginBottom: '0.5rem',
    },
    body1: {
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        },
      },
    },
  },
});

/**
 * Main Application Component
 * Handles routing, global layout, and theme provider setup
 */
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {/* Main navigation */}
          <TopNav />

          {/* Main content area */}
          <Box
            component="main"
            id="main-content"
            sx={{
              flex: 1,
              py: { xs: 2, md: 4 },
            }}
          >
            <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4 }, width: '100%', maxWidth: '100vw' }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/items" element={<Items />} />
                <Route path="/item/:id" element={<ItemDetail />} />
                
              </Routes>
            </Container>
          </Box>

          {/* Footer */}
          <Footer />
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
