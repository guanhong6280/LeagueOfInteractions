import React from 'react';
import * as MUI from '@mui/material';
import theme from '../../../../theme/theme';
import { Sort as SortIcon, Refresh as RefreshIcon } from '@mui/icons-material';

const CommentListHeader = ({ sortBy, setSortBy, onRefreshComments, isRefreshing = false }) => (
  <MUI.Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
    <MUI.Button
      startIcon={isRefreshing ? <MUI.CircularProgress size={16} thickness={6} sx={{ color: 'black' }} /> : <RefreshIcon />}
      onClick={onRefreshComments}
      disabled={isRefreshing}
      variant="contained"
      size="small"
      sx={{ 
        textTransform: 'uppercase',
        borderRadius: 0,
        fontWeight: 900,
        border: '2px solid black',
        boxShadow: '4px 4px 0px black',
        bgcolor: 'white',
        color: 'black',
        '&:hover': {
          bgcolor: isRefreshing ? 'white' : '#f0f0f0',
          transform: isRefreshing ? 'none' : 'translate(-2px, -2px)',
          boxShadow: isRefreshing ? '4px 4px 0px black' : '6px 6px 0px black',
        },
        '&:active': {
          transform: 'translate(0, 0)',
          boxShadow: 'none',
        },
        '&.Mui-disabled': {
          bgcolor: '#E0E0E0',
          color: '#9E9E9E',
          border: '2px solid #9E9E9E',
        },
        transition: 'all 0.1s',
      }}
    >
      {isRefreshing ? 'Refreshing...' : 'Refresh'}
    </MUI.Button>
    <MUI.Box display="flex" gap={1}>
      <MUI.FormControl size="small" sx={{ minWidth: 150 }}>
        <MUI.Select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          startAdornment={<SortIcon sx={{ mr: 1, color: 'black' }} />}
          sx={{ 
            fontSize: '0.875rem',
            fontWeight: 'bold',
            borderRadius: 0,
            border: '2px solid black',
            boxShadow: '4px 4px 0px black',
            bgcolor: theme.palette.button.expand_button,
            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
            '&:hover': {
               bgcolor: theme.palette.button.expand_button_hover,
            }
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                borderRadius: 0,
                border: '2px solid black',
                boxShadow: '4px 4px 0px black',
                mt: 1
              }
            }
          }}
        >
          <MUI.MenuItem value="newest" sx={{ fontWeight: 'bold' }}>Latest</MUI.MenuItem>
          <MUI.MenuItem value="oldest" sx={{ fontWeight: 'bold' }}>Oldest</MUI.MenuItem>
          <MUI.MenuItem value="mostLiked" sx={{ fontWeight: 'bold' }}>Most Liked</MUI.MenuItem>
        </MUI.Select>
      </MUI.FormControl>
    </MUI.Box>
  </MUI.Box>
);

export default CommentListHeader; 