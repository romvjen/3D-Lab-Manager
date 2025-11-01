import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Stack,
  Snackbar,
  Alert,
  Divider,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Flag as FlagIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { can } from '../../lib/permissions';

const STATUSES = ['Open', 'In Progress', 'Resolved'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

const IssuesAdmin = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [_loading, _setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [currentIssue, setCurrentIssue] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [newAssignee, setNewAssignee] = useState('');
  const [note, setNote] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const canWrite = can(user?.role, 'issues.write');

  const fetchIssues = async () => {
    _setLoading(true);
    try {
      const response = await fetch('/api/admin/issues');
      const data = await response.json();
      if (data.success) {
        setIssues(data.data);
      }
    } catch (_error) {
      showSnackbar('Failed to load issues', 'error');
    } finally {
      _setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleStatusChange = (issue) => {
    setCurrentIssue(issue);
    setNewStatus(issue.status);
    setNewAssignee(issue.assignee || '');
    setDialogOpen(true);
  };

  const handleAddNote = (issue) => {
    setCurrentIssue(issue);
    setNote('');
    setNoteDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setCurrentIssue(null);
  };

  const handleNoteDialogClose = () => {
    setNoteDialogOpen(false);
    setCurrentIssue(null);
    setNote('');
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(`/api/admin/issues/${currentIssue.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, assignee: newAssignee }),
      });

      const data = await response.json();
      if (data.success) {
        showSnackbar('Issue updated successfully', 'success');
        fetchIssues();
        handleDialogClose();
      }
    } catch (_error) {
      showSnackbar('Failed to update issue', 'error');
    }
  };

  const handleAddNoteSubmit = async () => {
    try {
      const response = await fetch(`/api/admin/issues/${currentIssue.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note }),
      });

      const data = await response.json();
      if (data.success) {
        showSnackbar('Note added successfully', 'success');
        fetchIssues();
        handleNoteDialogClose();
      }
    } catch (_error) {
      showSnackbar('Failed to add note', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Urgent':
        return 'error';
      case 'High':
        return 'warning';
      case 'Medium':
        return 'info';
      case 'Low':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open':
        return 'error';
      case 'In Progress':
        return 'warning';
      case 'Resolved':
        return 'success';
      default:
        return 'default';
    }
  };

  const groupedIssues = STATUSES.reduce((acc, status) => {
    acc[status] = issues.filter((issue) => issue.status === status);
    return acc;
  }, {});

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
          Issues Management
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Triage and manage reported issues
        </Typography>
      </Box>

      {/* Kanban Board */}
      <Grid container spacing={2}>
        {STATUSES.map((status) => (
          <Grid item xs={12} md={4} key={status}>
            <Card sx={{ bgcolor: 'background.default', height: '100%' }}>
              <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={groupedIssues[status].length}
                    size="small"
                    color={getStatusColor(status)}
                  />
                  {status}
                </Typography>
              </Box>
              <Divider />
              <Box sx={{ p: 2, maxHeight: '70vh', overflow: 'auto' }}>
                <Stack spacing={2}>
                  {groupedIssues[status].map((issue) => (
                    <Card key={issue.id} variant="outlined" sx={{ '&:hover': { boxShadow: 2 } }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1 }}>
                            {issue.title}
                          </Typography>
                          {canWrite && (
                            <IconButton
                              size="small"
                              onClick={() => handleStatusChange(issue)}
                              aria-label={`Edit ${issue.title}`}
                            >
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                        <Stack spacing={1}>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Chip
                              icon={<FlagIcon />}
                              label={issue.priority}
                              size="small"
                              color={getPriorityColor(issue.priority)}
                            />
                            <Chip
                              label={issue.lab}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                          {issue.item && (
                            <Typography variant="caption" color="text.secondary">
                              Item: {issue.item}
                            </Typography>
                          )}
                          {issue.assignee && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <AssignmentIcon fontSize="small" color="action" />
                              <Typography variant="caption" color="text.secondary">
                                {issue.assignee}
                              </Typography>
                            </Box>
                          )}
                          <Typography variant="caption" color="text.secondary">
                            Updated: {new Date(issue.updatedAt).toLocaleDateString()}
                          </Typography>
                          {canWrite && (
                            <Button
                              size="small"
                              variant="text"
                              onClick={() => handleAddNote(issue)}
                              sx={{ alignSelf: 'flex-start', mt: 1 }}
                            >
                              Add Note
                            </Button>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                  {groupedIssues[status].length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                      No issues
                    </Typography>
                  )}
                </Stack>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Status Change Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Update Issue</DialogTitle>
        <DialogContent>
          {currentIssue && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography variant="body2">
                <strong>{currentIssue.title}</strong>
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={newStatus}
                  label="Status"
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  {STATUSES.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Assignee"
                fullWidth
                value={newAssignee}
                onChange={(e) => setNewAssignee(e.target.value)}
                placeholder="Assign to user..."
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={noteDialogOpen} onClose={handleNoteDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add Note</DialogTitle>
        <DialogContent>
          {currentIssue && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Adding note to: <strong>{currentIssue.title}</strong>
              </Typography>
              <TextField
                label="Note"
                fullWidth
                multiline
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Enter note..."
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleNoteDialogClose}>Cancel</Button>
          <Button onClick={handleAddNoteSubmit} variant="contained" disabled={!note.trim()}>
            Add Note
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

export default IssuesAdmin;
