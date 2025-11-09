import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';

export default function AdminMain() {
  return (
    <Box
      component="main"
      flex={1}
      bgcolor="surface.main"
      color="text.primary"
      p={{ xs: 2, md: 4 }}>
      <Outlet />
    </Box>
  );
}