import React from 'react';
import { Box } from '@mui/material';
import AdminNav from '../admin/components/AdminNav';
import AdminMain from '../admin/components/AdminMain';
import AdminAside from '../admin/components/AdminSide';

// capture the height once, before render
const INITIAL_H =
  typeof window !== 'undefined'
    ? Math.floor(window.screen?.height || 0) * 0.88
    : 0;

export default function AdminLayout() {
  return (
    <Box
      minHeight={`${INITIAL_H}px`}
      bgcolor="background.default"
      p="20px"
      overflow="hidden"
      display="flex"
    >
      <Box
        mx="auto"
        flex={1}
        bgcolor="surface.frame"
        borderRadius="10px"
        overflow="hidden"
        p="20px"
        boxShadow="0 0 0 1px surface.hairlineDark"
        display="flex"
      >
        <AdminNav />

        <Box
          flex={1}
          display="flex"
          bgcolor="background.default"
          borderRadius="10px"
          overflow="hidden"
        >
          <AdminMain />
          <AdminAside />
        </Box>
      </Box>
    </Box>
  );
}