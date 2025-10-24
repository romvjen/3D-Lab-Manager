import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  Chip,
  Stack,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  QrCodeScanner as QrIcon,
  CameraAlt as CameraIcon,
  Refresh as RefreshIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';
//import { Html5QrcodeScanner } from 'html5-qrcode';

/**
 * QR Scanner Page Component
 * Allows scanning QR codes to quickly navigate to items or perform actions
 * Uses html5-qrcode library for cross-platform camera access
 */
function Scan() {
  const navigate = useNavigate();
  const scannerRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [cameraPermission, setCameraPermission] = useState('prompt');

  useEffect(() => {
    // Check camera permission status on load
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'camera' }).then((result) => {
        setCameraPermission(result.state);
      });
    }
  }, []);

  const startScanner = () => {
    if (!isScanning) {
      setIsScanning(true);
      setError(null);
      setScanResult(null);

      const scanner = new Html5QrcodeScanner(
        'qr-scanner-container',
        {
          fps: 10,
          qrbox: {
            width: 250,
            height: 250,
          },
          aspectRatio: 1.0,
          supportedScanTypes: [Html5QrcodeScanner.SCAN_TYPE_CAMERA],
        },
        /* verbose= */ false
      );

      scanner.render(
        (decodedText) => {
          console.log('QR Code scanned:', decodedText);
          handleScanSuccess(decodedText);
          scanner.clear();
        },
        (error) => {
          // Handle scan failure - this is expected for many frames
          if (error.includes('No QR code found')) {
            return; // Normal scanning state
          }
          console.log('QR scan error:', error);
        }
      );

      scannerRef.current = scanner;
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().then(() => {
        setIsScanning(false);
        scannerRef.current = null;
      }).catch((error) => {
        console.error('Error stopping scanner:', error);
        setIsScanning(false);
        scannerRef.current = null;
      });
    }
  };

  const handleScanSuccess = (decodedText) => {
    setIsScanning(false);
    setScanResult(decodedText);

    // Try to parse as item ID and navigate
    const itemIdMatch = decodedText.match(/(?:item[\/:]?|id[\/:]?)([A-Z0-9]+)/i);

    if (itemIdMatch) {
      const itemId = itemIdMatch[1].toUpperCase();
      console.log('Detected item ID:', itemId);

      // Navigate to item detail page
      setTimeout(() => {
        navigate(`/item/${itemId}`);
      }, 2000);
    } else if (decodedText.startsWith('http')) {
      // Handle URLs
      console.log('Detected URL:', decodedText);
      setTimeout(() => {
        window.open(decodedText, '_blank');
      }, 2000);
    } else {
      // Show generic result for other QR codes
      console.log('Generic QR code result:', decodedText);
    }
  };

  const handleRetry = () => {
    setScanResult(null);
    setError(null);
    startScanner();
  };

  useEffect(() => {
    return () => {
      // Cleanup scanner on unmount
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, []);

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <QrIcon sx={{ fontSize: '2rem', color: 'primary.main' }} />
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: { xs: '1.75rem', md: '2.25rem' },
              fontWeight: 700,
              color: 'primary.main'
            }}
          >
            QR Code Scanner
          </Typography>
        </Box>
        <Typography
          variant="body1"
          sx={{
            color: 'text.secondary',
            fontSize: '1rem',
            maxWidth: '600px'
          }}
        >
          Scan QR codes on lab equipment to quickly access item details and perform actions.
        </Typography>
      </Box>

      {/* Scanner Container */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          {/* Camera Permission Check */}
          {cameraPermission === 'denied' && (
            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Camera Access Denied
              </Typography>
              <Typography variant="body2">
                Please enable camera permissions in your browser settings to use the QR scanner.
              </Typography>
            </Alert>
          )}

          {/* Scan Result Display */}
          {scanResult && (
            <Alert
              severity="success"
              icon={<SuccessIcon />}
              sx={{ mb: 3 }}
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={handleRetry}
                  startIcon={<RefreshIcon />}
                >
                  Scan Again
                </Button>
              }
            >
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                QR Code Scanned Successfully!
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', mt: 1 }}>
                {scanResult}
              </Typography>
              {scanResult.match(/(?:item[\/:]?|id[\/:]?)([A-Z0-9]+)/i) && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Redirecting to item details...
                </Typography>
              )}
            </Alert>
          )}

          {/* Error Display */}
          {error && (
            <Alert
              severity="error"
              icon={<ErrorIcon />}
              sx={{ mb: 3 }}
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => setError(null)}
                >
                  Dismiss
                </Button>
              }
            >
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Scanner Error
              </Typography>
              <Typography variant="body2">
                {error}
              </Typography>
            </Alert>
          )}

          {/* Scanner Interface */}
          <Box sx={{ textAlign: 'center' }}>
            {!isScanning && !scanResult && (
              <Box>
                <Box
                  sx={{
                    width: '100%',
                    maxWidth: { xs: '100%', sm: 500, md: 600 },
                    height: { xs: 250, sm: 300, md: 400 },
                    mx: 'auto',
                    mb: 3,
                    border: '2px dashed',
                    borderColor: 'primary.main',
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'grey.50'
                  }}
                >
                  <QrIcon sx={{ fontSize: '4rem', color: 'primary.main', opacity: 0.6, mb: 2 }} />
                  <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
                    Ready to Scan
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Point your camera at a QR code
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  size="large"
                  onClick={startScanner}
                  startIcon={<CameraIcon />}
                  sx={{ mb: 2 }}
                  disabled={cameraPermission === 'denied'}
                >
                  Start Camera
                </Button>
              </Box>
            )}

            {isScanning && (
              <Box>
                <Box
                  id="qr-scanner-container"
                  sx={{
                    width: '100%',
                    maxWidth: { xs: '100%', sm: 500, md: 600 },
                    mx: 'auto',
                    mb: 3,
                    '& video': {
                      borderRadius: 2,
                      maxWidth: '100%',
                      height: 'auto'
                    }
                  }}
                />

                <Stack direction="row" spacing={2} justifyContent="center">
                  <Button
                    variant="outlined"
                    onClick={stopScanner}
                    startIcon={<RefreshIcon />}
                  >
                    Stop Scanner
                  </Button>
                </Stack>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 3,
          width: '100%'
        }}
      >
        {/* How to Use */}
        <Card sx={{ border: '1px solid', borderColor: 'divider', flex: 1 }}>
          <CardContent>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <InfoIcon sx={{ fontSize: '1.25rem' }} />
              How to Use
            </Typography>

            <List dense>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600 }}>
                    1
                  </Typography>
                </ListItemIcon>
                <ListItemText
                  primary="Click 'Start Camera' to begin scanning"
                  slotProps={{ primary: { variant: 'body2' } }}
                />
              </ListItem>

              <ListItem sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600 }}>
                    2
                  </Typography>
                </ListItemIcon>
                <ListItemText
                  primary="Point your camera at the QR code"
                  slotProps={{ primary: { variant: 'body2' } }}
                />
              </ListItem>

              <ListItem sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600 }}>
                    3
                  </Typography>
                </ListItemIcon>
                <ListItemText
                  primary="Wait for automatic detection and navigation"
                  slotProps={{ primary: { variant: 'body2' } }}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* Supported QR Codes */}
        <Card sx={{ border: '1px solid', borderColor: 'divider', flex: 1 }}>
          <CardContent>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <QrIcon sx={{ fontSize: '1.25rem' }} />
              Supported QR Codes
            </Typography>

            <Stack spacing={2}>
              <Box>
                <Chip
                  label="Item IDs"
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ mb: 1 }}
                />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  QR codes containing equipment IDs (e.g., "item:PRS001", "id/END001")
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Chip
                  label="URLs"
                  size="small"
                  color="secondary"
                  variant="outlined"
                  sx={{ mb: 1 }}
                />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Web links starting with http:// or https://
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Chip
                  label="General Text"
                  size="small"
                  variant="outlined"
                  sx={{ mb: 1 }}
                />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Any other QR code content will be displayed
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* Browser Compatibility Note */}
      <Alert
        severity="info"
        sx={{ mt: 3 }}
        icon={<InfoIcon />}
      >
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          Browser Compatibility
        </Typography>
        <Typography variant="body2">
          QR scanning requires camera access. Works best on modern browsers with HTTPS.
          On mobile devices, make sure to grant camera permissions when prompted.
        </Typography>
      </Alert>
    </Box>
  );
}

export default Scan;