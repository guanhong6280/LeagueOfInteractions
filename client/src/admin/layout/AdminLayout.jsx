import React, { useState } from 'react';
import * as MUI from '@mui/material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Comment as CommentIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  Home as HomeIcon,
  ExitToApp as ExitIcon
} from '@mui/icons-material';
import { useAuth } from '../../AuthProvider';

const DRAWER_WIDTH = 240;

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navigationItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
    { text: 'User Management', icon: <PeopleIcon />, path: '/admin/users' },
    { text: 'Comment Moderation', icon: <CommentIcon />, path: '/admin/comments' },
    { text: 'Analytics', icon: <AnalyticsIcon />, path: '/admin/analytics' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/admin/settings' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen(false); // Close mobile drawer after navigation
  };

  const handleBackToSite = () => {
    navigate('/');
  };

  const drawer = (
    <MUI.Box>
      {/* Admin Logo/Header */}
      <MUI.Box
        sx={{
          p: 2,
          bgcolor: 'primary.main',
          color: 'white',
          textAlign: 'center'
        }}
      >
        <MUI.Typography variant="h6" fontWeight="bold">
          Admin Panel
        </MUI.Typography>
        <MUI.Typography variant="caption">
          League Interactions
        </MUI.Typography>
      </MUI.Box>

      <MUI.Divider />

      {/* Navigation Items */}
      <MUI.List>
        {navigationItems.map((item) => (
          <MUI.ListItem key={item.text} disablePadding>
            <MUI.ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                '&.Mui-selected': {
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText',
                  '&:hover': {
                    bgcolor: 'primary.main',
                  }
                }
              }}
            >
              <MUI.ListItemIcon
                sx={{
                  color: location.pathname === item.path ? 'primary.contrastText' : 'inherit'
                }}
              >
                {item.icon}
              </MUI.ListItemIcon>
              <MUI.ListItemText primary={item.text} />
            </MUI.ListItemButton>
          </MUI.ListItem>
        ))}
      </MUI.List>

      <MUI.Divider />

      {/* Back to Site / Logout */}
      <MUI.List>
        <MUI.ListItem disablePadding>
          <MUI.ListItemButton onClick={handleBackToSite}>
            <MUI.ListItemIcon>
              <HomeIcon />
            </MUI.ListItemIcon>
            <MUI.ListItemText primary="Back to Site" />
          </MUI.ListItemButton>
        </MUI.ListItem>
        <MUI.ListItem disablePadding>
          <MUI.ListItemButton onClick={logout}>
            <MUI.ListItemIcon>
              <ExitIcon />
            </MUI.ListItemIcon>
            <MUI.ListItemText primary="Logout" />
          </MUI.ListItemButton>
        </MUI.ListItem>
      </MUI.List>
    </MUI.Box>
  );

  return (
    <MUI.Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <MUI.AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${DRAWER_WIDTH}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: 1
        }}
      >
        <MUI.Toolbar>
          <MUI.IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </MUI.IconButton>
          
          <MUI.Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Administration Dashboard
          </MUI.Typography>

          {/* User Info */}
          <MUI.Box display="flex" alignItems="center" gap={1}>
            <MUI.Avatar
              src={user?.profilePictureURL}
              alt={user?.username}
              sx={{ width: 32, height: 32 }}
            />
            <MUI.Typography variant="body2">
              {user?.username}
            </MUI.Typography>
          </MUI.Box>
        </MUI.Toolbar>
      </MUI.AppBar>

      {/* Navigation Drawer */}
      <MUI.Box
        component="nav"
        sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}
      >
        {/* Mobile drawer */}
        <MUI.Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {drawer}
        </MUI.Drawer>

        {/* Desktop drawer */}
        <MUI.Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
          open
        >
          {drawer}
        </MUI.Drawer>
      </MUI.Box>

      {/* Main Content */}
      <MUI.Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: 8, // Account for AppBar height
          bgcolor: 'background.default',
          minHeight: '100vh'
        }}
      >
        <Outlet />
      </MUI.Box>
    </MUI.Box>
  );
};

export default AdminLayout; 