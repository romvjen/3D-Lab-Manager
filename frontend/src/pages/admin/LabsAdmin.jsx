import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Drawer,
  Grid,
  IconButton,
  TextField,
  Typography,
  Chip,
  Stack,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Science as ScienceIcon,
  Room as RoomIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { can } from '../../lib/permissions';

const LabsAdmin = () => {
  const { user } = useAuth();
  const [labs, setLabs] = useState([]);
  const [_loading, _setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentLab, setCurrentLab] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    building: '',
    rooms: [],
    modelUrl: '',
  });
  const [newRoom, setNewRoom] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const canWrite = can(user?.role, 'labs.write');

  const fetchLabs = async () => {
    _setLoading(true);
    try {
      const response = await fetch('/api/admin/labs');
      const data = await response.json();
      if (data.success) {
        setLabs(data.data);
      }
    } catch (_error) {
      showSnackbar('Failed to load labs', 'error');
    } finally {
      _setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabs();
  }, []);

  const handleEditClick = (lab) => {
    setCurrentLab(lab);
    setFormData({
      name: lab.name,
      building: lab.building,
      rooms: [...lab.rooms],
      modelUrl: lab.modelUrl || '',
    });
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setCurrentLab(null);
    setNewRoom('');
  };

  const handleAddRoom = () => {
    if (newRoom.trim()) {
      setFormData({
        ...formData,
        rooms: [...formData.rooms, newRoom.trim()],
      });
      setNewRoom('');
    }
  };

  const handleRemoveRoom = (index) => {
    setFormData({
      ...formData,
      rooms: formData.rooms.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(`/api/admin/labs/${currentLab.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        showSnackbar('Lab updated successfully', 'success');
        fetchLabs();
        handleDrawerClose();
      }
    } catch (_error) {
      showSnackbar('Failed to update lab', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
          Labs Management
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Manage lab spaces, rooms, and 3D assets
        </Typography>
      </Box>

      {/* Labs Grid */}
      <Grid container spacing={3}>
        {labs.map((lab) => (
          <Grid item xs={12} sm={6} md={4} key={lab.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ScienceIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                    {lab.name}
                  </Typography>
                </Box>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <RoomIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {lab.building}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Rooms: {lab.roomsCount}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InventoryIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Items: {lab.itemsCount}
                    </Typography>
                  </Box>
                </Stack>
                {lab.modelUrl && (
                  <Chip
                    label="3D Model Available"
                    size="small"
                    color="success"
                    sx={{ mt: 2 }}
                  />
                )}
              </CardContent>
              {canWrite && (
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleEditClick(lab)}
                    aria-label={`Edit ${lab.name}`}
                  >
                    Edit
                  </Button>
                </CardActions>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Edit Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerClose}
        PaperProps={{ sx: { width: { xs: '100%', sm: 400 } } }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Edit Lab
          </Typography>
          <Stack spacing={3}>
            <TextField
              label="Lab Name"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              label="Building"
              fullWidth
              value={formData.building}
              onChange={(e) => setFormData({ ...formData, building: e.target.value })}
            />
            <TextField
              label="3D Model URL"
              fullWidth
              placeholder="/models/lab.glb"
              helperText="Path to GLB model file"
              value={formData.modelUrl}
              onChange={(e) => setFormData({ ...formData, modelUrl: e.target.value })}
            />
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Rooms
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Add room..."
                  value={newRoom}
                  onChange={(e) => setNewRoom(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddRoom()}
                />
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddRoom}
                  disabled={!newRoom.trim()}
                >
                  Add
                </Button>
              </Box>
              <List dense>
                {formData.rooms.map((room, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemText primary={room} />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          aria-label="delete room"
                          onClick={() => handleRemoveRoom(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < formData.rooms.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
                {formData.rooms.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                    No rooms added
                  </Typography>
                )}
              </List>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
              <Button fullWidth onClick={handleDrawerClose}>
                Cancel
              </Button>
              <Button fullWidth variant="contained" onClick={handleSubmit}>
                Save Changes
              </Button>
            </Box>
          </Stack>
        </Box>
      </Drawer>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LabsAdmin;
