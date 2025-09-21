import React from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Box,
  IconButton
} from '@mui/material';
import {
  OpenInNew as OpenInNewIcon,
  LocationOn as LocationIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';

/**
 * ItemCard Component
 * Displays individual item information in a card layout
 * Used in the Items page grid/list view
 */
function ItemCard({ item }) {
  // Get status color for the chip
  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'checked_out':
        return 'warning';
      case 'broken':
        return 'error';
      default:
        return 'default';
    }
  };

  // Format status text for display
  const formatStatus = (status) => {
    return status.replace('_', ' ').toUpperCase();
  };

  return (
    <Card
      component={Link}
      to={`/item/${item.id}`}
      sx={{
        height: 360, // Fixed height for consistency (reduced for 6 per row)
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'all 0.2s ease-in-out',
        border: '1px solid',
        borderColor: 'divider',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 4,
          textDecoration: 'none'
        },
        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: 'primary.main',
          outlineOffset: '2px'
        }
      }}
    >
      {/* Item Image */}
      <Box
        sx={{
          height: 120, // Reduced for better proportions with 6 cards
          backgroundColor: 'grey.100',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          flexShrink: 0
        }}
      >
        <CardMedia
          component="img"
          height="120"
          image={item.thumbnailUrl}
          alt={`${item.name} thumbnail`}
          sx={{
            objectFit: 'cover',
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0
          }}
          onError={(e) => {
            // Hide the broken image and show placeholder instead
            e.target.style.display = 'none';
          }}
        />
        {/* Fallback placeholder */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'text.secondary',
            p: 2,
            textAlign: 'center'
          }}
        >
          <InventoryIcon sx={{ fontSize: '2rem', mb: 1, opacity: 0.6 }} />
          <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
            {item.category}
          </Typography>
        </Box>
      </Box>

      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          p: 2,
          height: 240, // Fixed content height (reduced for smaller cards)
          overflow: 'hidden',
          flexShrink: 0
        }}
      >
        {/* Header with ID and Status */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 1,
            height: 28, // Fixed height
            flexShrink: 0
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontSize: '0.75rem',
              fontFamily: 'monospace'
            }}
          >
            {item.id}
          </Typography>

          <Chip
            label={formatStatus(item.status)}
            color={getStatusColor(item.status)}
            size="small"
            sx={{
              fontSize: '0.6875rem',
              height: 20,
              '& .MuiChip-label': {
                px: 1
              }
            }}
          />
        </Box>

        {/* Item Name */}
        <Box sx={{ height: 48, flexShrink: 0, display: 'flex', alignItems: 'flex-start' }}>
          <Typography
            variant="h6"
            component="h3"
            sx={{
              fontSize: '0.95rem',
              fontWeight: 600,
              color: 'text.primary',
              lineHeight: 1.2,
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 2,
              overflow: 'hidden',
              height: '2.4em' // Fixed height for consistency
            }}
          >
            {item.name}
          </Typography>
        </Box>

        {/* Category */}
        <Box sx={{ height: 32, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          <Chip
            label={item.category}
            variant="outlined"
            size="small"
            sx={{
              fontSize: '0.6875rem',
              height: 24
            }}
          />
        </Box>

        {/* Location */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 0.5,
            height: 48, // Fixed height for location section
            flexShrink: 0,
            mt: 1
          }}
        >
          <LocationIcon
            sx={{
              fontSize: '1rem',
              color: 'text.secondary',
              mt: 0.1,
              flexShrink: 0
            }}
          />
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontSize: '0.75rem',
              lineHeight: 1.2,
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 2,
              overflow: 'hidden',
              height: '2.4em' // Fixed height for location
            }}
          >
            {item.locationPath}
          </Typography>
        </Box>

        {/* View Details Button */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pt: 0.1,
            borderTop: '0.5px solid',
            borderColor: 'divider',
            height: 20, // Fixed height for button area
            flexShrink: 0,
            mt :'auto'
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: 'primary.main',
              fontSize: '0.8125rem',
              fontWeight: 500
            }}
          >
            View Details
          </Typography>

          <IconButton
            size="small"
            sx={{
              color: 'primary.main',
              p: 0.5
            }}
            tabIndex={-1} // Prevent double tab since the whole card is clickable
          >
            <OpenInNewIcon sx={{ fontSize: '1rem' }} />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
}

export default ItemCard;