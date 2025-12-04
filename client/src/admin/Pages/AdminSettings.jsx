import React, { useState } from 'react';
import * as MUI from '@mui/material';
import axios from 'axios';
import SyncIcon from '@mui/icons-material/Sync';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

const AdminSettings = () => {
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

  const handleSyncSkins = async () => {
    setSyncLoading(true);
    setSyncResult(null);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5174'}/api/skins/sync`,
        {},
        { withCredentials: true }
      );
      
      setSyncResult({
        success: true,
        data: response.data.data
      });
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncResult({
        success: false,
        message: error.response?.data?.error || error.message
      });
    } finally {
      setSyncLoading(false);
    }
  };

  return (
    <MUI.Box>
      <MUI.Typography variant="h4" fontWeight="900" gutterBottom>
        Admin Settings
      </MUI.Typography>
      <MUI.Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Configure system parameters and run maintenance tasks.
      </MUI.Typography>

      <MUI.Divider sx={{ mb: 4 }} />

      <MUI.Paper 
        variant="outlined" 
        sx={{ 
          p: 3, 
          bgcolor: 'background.paper',
          borderColor: 'divider'
        }}
      >
        <MUI.Stack direction="row" alignItems="center" gap={2} mb={2}>
          <SyncIcon color="primary" />
          <MUI.Typography variant="h6" fontWeight="bold">
            Skin Database Synchronization
          </MUI.Typography>
        </MUI.Stack>

        <MUI.Typography variant="body2" sx={{ mb: 3, maxWidth: '600px' }}>
          Manually trigger a synchronization with CommunityDragon to fetch the latest champion skins, 
          update rarities, and refresh metadata. This is usually handled by a weekly scheduled task.
        </MUI.Typography>

        <MUI.Button 
          variant="contained" 
          color="primary" 
          startIcon={syncLoading ? <MUI.CircularProgress size={20} color="inherit" /> : <SyncIcon />}
          onClick={handleSyncSkins}
          disabled={syncLoading}
          sx={{ fontWeight: 'bold' }}
        >
          {syncLoading ? 'Syncing...' : 'Sync Skins Now'}
        </MUI.Button>

        {syncResult && (
          <MUI.Box mt={3} p={2} bgcolor={syncResult.success ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)'} borderRadius={1}>
             <MUI.Stack direction="row" gap={1} alignItems="flex-start">
                {syncResult.success ? <CheckCircleIcon color="success" /> : <ErrorIcon color="error" />}
                <MUI.Box>
                  <MUI.Typography variant="subtitle2" fontWeight="bold" color={syncResult.success ? 'success.main' : 'error.main'}>
                    {syncResult.success ? 'Synchronization Successful' : 'Synchronization Failed'}
                  </MUI.Typography>
                  {syncResult.success && syncResult.data ? (
                    <MUI.Typography variant="caption" display="block" mt={0.5}>
                      Processed: {syncResult.data.totalProcessed} | Updated: {syncResult.data.totalUpdated} | Errors: {syncResult.data.errors?.length || 0}
                    </MUI.Typography>
                  ) : (
                    <MUI.Typography variant="caption" display="block" mt={0.5}>
                      {syncResult.message}
                    </MUI.Typography>
                  )}
                </MUI.Box>
             </MUI.Stack>
          </MUI.Box>
        )}
      </MUI.Paper>
    </MUI.Box>
  );
};

export default AdminSettings;

