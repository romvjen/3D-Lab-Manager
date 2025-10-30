import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Divider,
  Alert,
  Link,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';

/**
 * Auth Page Component
 * Unified authentication page with login and signup tabs
 * Frontend only - Backend integration with Supabase will be added later
 */
function Auth() {
  const navigate = useNavigate();
  const { login, signup, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState(0); // 0 = Login, 1 = Sign Up
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Form state for login
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    role: 'admin' // For testing/demo
  });

  // Form state for signup
  const [signupForm, setSignupForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'viewer' // For testing/demo
  });

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError('');
    setSuccess('');
  };

  // Handle login form change
  const handleLoginChange = (field) => (event) => {
    setLoginForm({ ...loginForm, [field]: event.target.value });
    setError('');
  };

  // Handle signup form change
  const handleSignupChange = (field) => (event) => {
    setSignupForm({ ...signupForm, [field]: event.target.value });
    setError('');
  };

  // Validate email format
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle login submission
  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!loginForm.email || !loginForm.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (!isValidEmail(loginForm.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      // Use auth context login (will be connected to Supabase later)
      const result = await login(loginForm.email, loginForm.password, loginForm.role);

      if (result.success) {
        // Redirect based on role
        if (loginForm.role === 'admin' || loginForm.role === 'labManager') {
          navigate('/admin/items');
        } else {
          navigate('/');
        }
      } else {
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle signup submission
  const handleSignupSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!signupForm.firstName || !signupForm.lastName || !signupForm.email ||
        !signupForm.password || !signupForm.confirmPassword) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (!isValidEmail(signupForm.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (signupForm.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Use auth context signup (will be connected to Supabase later)
      const result = await signup(signupForm);

      if (result.success) {
        setSuccess('Account created successfully! Redirecting...');
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setError(result.error || 'Signup failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 200px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4
      }}
    >
      <Card
        sx={{
          maxWidth: 480,
          width: '100%',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        {/* Header with UTA branding */}
        <Box
          sx={{
            backgroundColor: 'primary.main',
            color: 'white',
            py: 3,
            px: 3,
            textAlign: 'center'
          }}
        >
          <Typography
            variant="h5"
            component="h1"
            sx={{
              fontWeight: 700,
              mb: 0.5,
              letterSpacing: '-0.025em'
            }}
          >
            3D Lab Manager
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '0.875rem'
            }}
          >
            University of Texas at Arlington
          </Typography>
        </Box>

        <CardContent sx={{ p: 0 }}>
          {/* Tabs for Login/Signup */}
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                py: 2,
                fontWeight: 600,
                fontSize: '0.9375rem'
              }
            }}
          >
            <Tab
              label="Login"
              icon={<LoginIcon sx={{ fontSize: '1.25rem' }} />}
              iconPosition="start"
              aria-label="Login tab"
            />
            <Tab
              label="Sign Up"
              icon={<PersonAddIcon sx={{ fontSize: '1.25rem' }} />}
              iconPosition="start"
              aria-label="Sign up tab"
            />
          </Tabs>

          {/* Form Container */}
          <Box sx={{ p: 3 }}>
            {/* Error/Success Messages */}
            {error && (
              <Alert
                severity="error"
                sx={{ mb: 2 }}
                onClose={() => setError('')}
              >
                {error}
              </Alert>
            )}

            {success && (
              <Alert
                severity="success"
                sx={{ mb: 2 }}
              >
                {success}
              </Alert>
            )}

            {/* Login Form */}
            {activeTab === 0 && (
              <Box
                component="form"
                onSubmit={handleLoginSubmit}
                sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: 'text.primary',
                    mb: 0.5
                  }}
                >
                  Welcome Back
                </Typography>

                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={loginForm.email}
                  onChange={handleLoginChange('email')}
                  autoComplete="email"
                  required
                  inputProps={{
                    'aria-label': 'Email address'
                  }}
                />

                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={loginForm.password}
                  onChange={handleLoginChange('password')}
                  autoComplete="current-password"
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  inputProps={{
                    'aria-label': 'Password'
                  }}
                />

                <FormControl fullWidth>
                  <InputLabel>Role (Demo/Testing)</InputLabel>
                  <Select
                    value={loginForm.role}
                    label="Role (Demo/Testing)"
                    onChange={handleLoginChange('role')}
                  >
                    <MenuItem value="admin">Administrator</MenuItem>
                    <MenuItem value="labManager">Lab Manager</MenuItem>
                    <MenuItem value="staff">Staff</MenuItem>
                    <MenuItem value="viewer">Viewer</MenuItem>
                  </Select>
                </FormControl>

                <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
                  <strong>Demo Mode:</strong> Select a role to test different permission levels. Admin and Lab Manager roles have access to the admin panel.
                </Alert>

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    fontWeight: 600,
                    fontSize: '1rem',
                    mt: 1
                  }}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>

                <Divider sx={{ my: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', px: 2 }}
                  >
                    or
                  </Typography>
                </Divider>

                <Typography
                  variant="body2"
                  sx={{ textAlign: 'center', color: 'text.secondary' }}
                >
                  Don't have an account?{' '}
                  <Link
                    component="button"
                    type="button"
                    onClick={() => setActiveTab(1)}
                    sx={{
                      color: 'primary.main',
                      fontWeight: 600,
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    Sign up
                  </Link>
                </Typography>
              </Box>
            )}

            {/* Signup Form */}
            {activeTab === 1 && (
              <Box
                component="form"
                onSubmit={handleSignupSubmit}
                sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: 'text.primary',
                    mb: 0.5
                  }}
                >
                  Create Your Account
                </Typography>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={signupForm.firstName}
                    onChange={handleSignupChange('firstName')}
                    autoComplete="given-name"
                    required
                    inputProps={{
                      'aria-label': 'First name'
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Last Name"
                    value={signupForm.lastName}
                    onChange={handleSignupChange('lastName')}
                    autoComplete="family-name"
                    required
                    inputProps={{
                      'aria-label': 'Last name'
                    }}
                  />
                </Box>

                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={signupForm.email}
                  onChange={handleSignupChange('email')}
                  autoComplete="email"
                  required
                  helperText="Use your UTA email address (@mavs.uta.edu)"
                  inputProps={{
                    'aria-label': 'Email address'
                  }}
                />

                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={signupForm.password}
                  onChange={handleSignupChange('password')}
                  autoComplete="new-password"
                  required
                  helperText="Minimum 8 characters"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  inputProps={{
                    'aria-label': 'Password'
                  }}
                />

                <TextField
                  fullWidth
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={signupForm.confirmPassword}
                  onChange={handleSignupChange('confirmPassword')}
                  autoComplete="new-password"
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle confirm password visibility"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  inputProps={{
                    'aria-label': 'Confirm password'
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    fontWeight: 600,
                    fontSize: '1rem',
                    mt: 1
                  }}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>

                <Divider sx={{ my: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', px: 2 }}
                  >
                    or
                  </Typography>
                </Divider>

                <Typography
                  variant="body2"
                  sx={{ textAlign: 'center', color: 'text.secondary' }}
                >
                  Already have an account?{' '}
                  <Link
                    component="button"
                    type="button"
                    onClick={() => setActiveTab(0)}
                    sx={{
                      color: 'primary.main',
                      fontWeight: 600,
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    Login
                  </Link>
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>

        {/* Footer */}
        <Box
          sx={{
            borderTop: '1px solid',
            borderColor: 'divider',
            py: 2,
            px: 3,
            backgroundColor: 'grey.50',
            textAlign: 'center'
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontSize: '0.75rem',
              lineHeight: 1.6
            }}
          >
            By using this system, you agree to the{' '}
            <Link
              href="https://www.uta.edu/legal"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: 'primary.main',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              UTA Terms of Use
            </Link>
            {' '}and{' '}
            <Link
              href="https://www.uta.edu/administration/legal-affairs/privacy"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: 'primary.main',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              Privacy Policy
            </Link>
          </Typography>
        </Box>
      </Card>
    </Box>
  );
}

export default Auth;
