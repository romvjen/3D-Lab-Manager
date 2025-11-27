import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Typography,
  Chip,
  Stack,
  Snackbar,
  Alert,
  IconButton,
  CardMedia,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Science as ScienceIcon,
} from '@mui/icons-material';
import { getLabs, createLab, updateLab, deleteLab } from '../../lib/supabaseLabs';

const LabsAdmin = () => {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentLab, setCurrentLab] = useState(null);
  const [labToDelete, setLabToDelete] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    blurb: '',
    modelPath: '',
    thumbnailUrl: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchLabs = async () => {
    setLoading(true);
    try {
      const data = await getLabs();
      setLabs(data);
    } catch (error) {
      console.error('Failed to load labs:', error);
      showSnackbar('Failed to load labs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabs();
  }, []);

  const handleAddClick = () => {
    setCurrentLab(null);
    setFormData({
      id: '',
      name: '',
      blurb: '',
      modelPath: '',
      thumbnailUrl: '',
    });
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleEditClick = (lab) => {
    setCurrentLab(lab);
    setFormData({
      id: lab.id,
      name: lab.name,
      blurb: lab.blurb || '',
      modelPath: lab.modelPath || '',
      thumbnailUrl: lab.thumbnailUrl || '',
    });
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleDeleteClick = (lab) => {
    setLabToDelete(lab);
    setDeleteDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setCurrentLab(null);
    setFormErrors({});
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setLabToDelete(null);
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.id.trim()) {
      errors.id = 'Lab ID is required';
    }
    if (!formData.name.trim()) {
      errors.name = 'Lab name is required';
    }
    if (!formData.blurb.trim()) {
      errors.blurb = 'Description is required';
    }
    if (!formData.modelPath.trim()) {
      errors.modelPath = 'Model path is required';
    }
    if (!formData.thumbnailUrl.trim()) {
      errors.thumbnailUrl = 'Thumbnail URL is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      if (currentLab) {
        // Update existing lab
        await updateLab(currentLab.id, {
          name: formData.name,
          blurb: formData.blurb,
          modelPath: formData.modelPath,
          thumbnailUrl: formData.thumbnailUrl,
        });
        showSnackbar('Lab updated successfully', 'success');
      } else {
        // Create new lab
        await createLab(formData);
        showSnackbar('Lab created successfully', 'success');
      }
      fetchLabs();
      handleDialogClose();
    } catch (error) {
      console.error('Failed to save lab:', error);
      showSnackbar(error.message || 'Failed to save lab', 'error');
    }
  };

  const handleDelete = async () => {
    if (!labToDelete) return;

    try {
      await deleteLab(labToDelete.id);
      showSnackbar('Lab deleted successfully', 'success');
      fetchLabs();
      handleDeleteDialogClose();
    } catch (error) {
      console.error('Failed to delete lab:', error);
      showSnackbar(error.message || 'Failed to delete lab', 'error');
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
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
            Labs Management
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage lab spaces and 3D models
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
          aria-label="Add new lab"
        >
          Add Lab
        </Button>
      </Box>

      {/* Labs Grid */}
      {loading ? (
        <Typography>Loading labs...</Typography>
      ) : labs.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 6 }}>
          <CardContent>
            <ScienceIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No labs found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Get started by adding your first lab
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddClick}>
              Add Lab
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {labs.map((lab) => (
            <Grid item xs={12} sm={6} md={4} key={lab.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {lab.thumbnailUrl && (
                  <CardMedia
                    component="img"
                    height="140"
                    image={lab.thumbnailUrl}
                    alt={lab.name}
                    sx={{ objectFit: 'cover' }}
                  />
                )}
                <CardContent sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <ScienceIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                      {lab.name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {lab.blurb}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip label={`ID: ${lab.id}`} size="small" variant="outlined" />
                    {lab.modelPath && (
                      <Chip label="3D Model" size="small" color="success" />
                    )}
                  </Stack>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleEditClick(lab)}
                    aria-label={`Edit ${lab.name}`}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteClick(lab)}
                    aria-label={`Delete ${lab.name}`}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {currentLab ? 'Edit Lab' : 'Add New Lab'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Lab ID"
              fullWidth
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              error={!!formErrors.id}
              helperText={formErrors.id || 'e.g., erb_202'}
              disabled={!!currentLab}
              required
            />
            <TextField
              label="Lab Name"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={!!formErrors.name}
              helperText={formErrors.name || 'e.g., ERB 202'}
              required
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={2}
              value={formData.blurb}
              onChange={(e) => setFormData({ ...formData, blurb: e.target.value })}
              error={!!formErrors.blurb}
              helperText={formErrors.blurb || 'e.g., Senior Design Lab'}
              required
            />
            <TextField
              label="Model Path"
              fullWidth
              value={formData.modelPath}
              onChange={(e) => setFormData({ ...formData, modelPath: e.target.value })}
              error={!!formErrors.modelPath}
              helperText={formErrors.modelPath || 'e.g., /models/no_origin_202.glb'}
              placeholder="/models/lab.glb"
              required
            />
            <TextField
              label="Thumbnail URL"
              fullWidth
              value={formData.thumbnailUrl}
              onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
              error={!!formErrors.thumbnailUrl}
              helperText={formErrors.thumbnailUrl || 'e.g., /images/erb_202.png'}
              placeholder="/images/lab.png"
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {currentLab ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose}>
        <DialogTitle>Delete Lab</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{labToDelete?.name}</strong>?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

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
