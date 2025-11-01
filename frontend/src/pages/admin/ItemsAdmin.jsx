import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  Menu,
  MenuItem,
  Select,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Toolbar,
  Checkbox,
  Snackbar,
  Alert,
  Paper,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  QrCode as QrCodeIcon,
  SwapHoriz as SwapHorizIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { can } from '../../lib/permissions';

const CATEGORIES = ['3D Printer', 'Electronics', 'Tools', 'Computers', 'Safety Equipment', 'Other'];
const STATUSES = ['Active', 'Maintenance', 'Retired'];

const ItemsAdmin = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [_loading, _setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selected, setSelected] = useState([]);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [currentItem, setCurrentItem] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkStatus, setBulkStatus] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    lab: '',
    status: 'Active',
    notes: '',
    assetTag: '',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const canWrite = can(user?.role, 'items.write');

  const fetchItems = async () => {
    _setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('q', search);
      if (filterCategory !== 'all') params.append('category', filterCategory);
      if (filterStatus !== 'all') params.append('status', filterStatus);

      const response = await fetch(`/api/admin/items?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        setItems(data.data);
      }
    } catch (_error) {
      showSnackbar('Failed to load items', 'error');
    } finally {
      _setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [search, filterCategory, filterStatus]);

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(items.map((item) => item.id));
    } else {
      setSelected([]);
    }
  };

  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const handleMenuOpen = (event, item) => {
    setMenuAnchor(event.currentTarget);
    setCurrentItem(item);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setCurrentItem(null);
  };

  const handleAddClick = () => {
    setFormData({
      name: '',
      category: '',
      lab: '',
      status: 'Active',
      notes: '',
      assetTag: '',
    });
    setCurrentItem(null);
    setDialogOpen(true);
  };

  const handleEditClick = () => {
    setFormData({
      name: currentItem.name,
      category: currentItem.category,
      lab: currentItem.lab,
      status: currentItem.status,
      notes: currentItem.notes || '',
      assetTag: currentItem.assetTag || '',
    });
    handleMenuClose();
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setCurrentItem(null);
  };

  const handleSubmit = async () => {
    try {
      const url = currentItem
        ? `/api/admin/items/${currentItem.id}`
        : '/api/admin/items';
      const method = currentItem ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        showSnackbar(
          currentItem ? 'Item updated successfully' : 'Item created successfully',
          'success'
        );
        fetchItems();
        handleDialogClose();
      }
    } catch (_error) {
      showSnackbar('Failed to save item', 'error');
    }
  };

  const handleBulkStatusChange = async () => {
    try {
      const response = await fetch('/api/admin/items/bulk-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selected, status: bulkStatus }),
      });

      const data = await response.json();
      if (data.success) {
        showSnackbar(`${selected.length} items updated`, 'success');
        setSelected([]);
        fetchItems();
        setBulkDialogOpen(false);
      }
    } catch (_error) {
      showSnackbar('Failed to update items', 'error');
    }
  };

  const handlePrintQR = () => {
    showSnackbar('QR code generated (mock)', 'info');
    handleMenuClose();
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Maintenance':
        return 'warning';
      case 'Retired':
        return 'error';
      default:
        return 'default';
    }
  };

  const filteredItems = items;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
          Items Management
        </Typography>
        {canWrite && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
            aria-label="Add new item"
          >
            Add Item
          </Button>
        )}
      </Box>

      {/* Toolbar */}
      <Card sx={{ mb: 2 }}>
        <Toolbar sx={{ gap: 2, flexWrap: 'wrap', py: 2 }}>
          <TextField
            placeholder="Search items..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={{ minWidth: 250 }}
            aria-label="Search items"
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={filterCategory}
              label="Category"
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <MenuItem value="all">All Categories</MenuItem>
              {CATEGORIES.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              label="Status"
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              {STATUSES.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {selected.length > 0 && canWrite && (
            <Button
              variant="outlined"
              onClick={() => setBulkDialogOpen(true)}
              sx={{ ml: 'auto' }}
            >
              Change Status ({selected.length})
            </Button>
          )}
        </Toolbar>
      </Card>

      {/* Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table aria-label="Items table">
            <TableHead>
              <TableRow>
                {canWrite && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selected.length > 0 && selected.length < items.length}
                      checked={items.length > 0 && selected.length === items.length}
                      onChange={handleSelectAll}
                      inputProps={{ 'aria-label': 'Select all items' }}
                    />
                  </TableCell>
                )}
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Lab</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Updated</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredItems
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((item) => (
                  <TableRow
                    key={item.id}
                    hover
                    selected={selected.includes(item.id)}
                  >
                    {canWrite && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selected.includes(item.id)}
                          onChange={() => handleSelect(item.id)}
                          inputProps={{ 'aria-label': `Select ${item.name}` }}
                        />
                      </TableCell>
                    )}
                    <TableCell>{item.id}</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.lab}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.status}
                        color={getStatusColor(item.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{new Date(item.updatedAt).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, item)}
                        aria-label={`Actions for ${item.name}`}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredItems.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* Actions Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        {canWrite && (
          <MenuItem onClick={handleEditClick}>
            <EditIcon sx={{ mr: 1 }} fontSize="small" />
            Edit
          </MenuItem>
        )}
        <MenuItem onClick={handlePrintQR}>
          <QrCodeIcon sx={{ mr: 1 }} fontSize="small" />
          Print QR Code
        </MenuItem>
      </Menu>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>{currentItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              fullWidth
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                label="Category"
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {CATEGORIES.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Lab"
              fullWidth
              required
              value={formData.lab}
              onChange={(e) => setFormData({ ...formData, lab: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                {STATUSES.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Asset Tag"
              fullWidth
              value={formData.assetTag}
              onChange={(e) => setFormData({ ...formData, assetTag: e.target.value })}
            />
            <TextField
              label="Notes"
              fullWidth
              multiline
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {currentItem ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Status Dialog */}
      <Dialog open={bulkDialogOpen} onClose={() => setBulkDialogOpen(false)}>
        <DialogTitle>Change Status for {selected.length} Items</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>New Status</InputLabel>
            <Select
              value={bulkStatus}
              label="New Status"
              onChange={(e) => setBulkStatus(e.target.value)}
            >
              {STATUSES.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleBulkStatusChange} variant="contained" disabled={!bulkStatus}>
            Update
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

export default ItemsAdmin;
