import React from 'react';
import {
  TextField,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';

/**
 * SearchBar Component
 * Provides search functionality with debounced input
 * Includes clear button and proper accessibility
 */
function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = "Search items by name, category, or location...",
  disabled = false
}) {
  return (
    <TextField
      fullWidth
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      variant="outlined"
      size="medium"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon
              sx={{
                color: disabled ? 'text.disabled' : 'text.secondary',
                fontSize: '1.25rem'
              }}
            />
          </InputAdornment>
        ),
        endAdornment: value && (
          <InputAdornment position="end">
            <IconButton
              onClick={onClear}
              edge="end"
              size="small"
              aria-label="Clear search"
              disabled={disabled}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              }}
            >
              <ClearIcon sx={{ fontSize: '1rem' }} />
            </IconButton>
          </InputAdornment>
        )
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          backgroundColor: 'background.paper',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'primary.main',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'primary.main',
            borderWidth: 2,
          }
        },
        '& .MuiInputBase-input': {
          fontSize: '1rem',
          '&::placeholder': {
            color: 'text.secondary',
            opacity: 0.8
          }
        }
      }}
      inputProps={{
        'aria-label': 'Search items',
        autoComplete: 'off'
      }}
    />
  );
}

export default SearchBar;