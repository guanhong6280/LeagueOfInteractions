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
      sx={{ textTransform: 'none', borderRadius: 2 }}
    >
      Refresh
    </MUI.Button>
    <MUI.Box display="flex" gap={1}>
      <MUI.FormControl size="small" sx={{ minWidth: 120 }}>
        <MUI.Select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          startAdornment={<SortIcon sx={{ mr: 1, color: 'text.secondary' }} />}
          sx={{ fontSize: '0.875rem' }}
        >
          <MUI.MenuItem value="newest">Newest First</MUI.MenuItem>
          <MUI.MenuItem value="oldest">Oldest First</MUI.MenuItem>
          <MUI.MenuItem value="mostLiked">Most Liked</MUI.MenuItem>
        </MUI.Select>
      </MUI.FormControl>
    </MUI.Box>
  </MUI.Box>
);

export default CommentListHeader; 