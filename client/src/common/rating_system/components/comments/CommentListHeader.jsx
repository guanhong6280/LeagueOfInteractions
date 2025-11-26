import React from 'react';
import * as MUI from '@mui/material';
import { Sort as SortIcon, Refresh as RefreshIcon } from '@mui/icons-material';

const CommentListHeader = ({ sortBy, setSortBy, onRefreshComments }) => (
  <MUI.Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
    <MUI.Button
      startIcon={<RefreshIcon />}
      onClick={onRefreshComments}
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
          bgcolor: '#f0f0f0',
          transform: 'translate(-2px, -2px)',
          boxShadow: '6px 6px 0px black',
        },
        '&:active': {
          transform: 'translate(0, 0)',
          boxShadow: 'none',
        },
        transition: 'all 0.1s',
      }}
    >
      Refresh
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
            bgcolor: 'white',
            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
            '&:hover': {
               bgcolor: '#f0f0f0',
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
          <MUI.MenuItem value="newest" sx={{ fontWeight: 'bold' }}>Newest First</MUI.MenuItem>
          <MUI.MenuItem value="oldest" sx={{ fontWeight: 'bold' }}>Oldest First</MUI.MenuItem>
          <MUI.MenuItem value="mostLiked" sx={{ fontWeight: 'bold' }}>Most Liked</MUI.MenuItem>
        </MUI.Select>
      </MUI.FormControl>
    </MUI.Box>
  </MUI.Box>
);

export default CommentListHeader; 