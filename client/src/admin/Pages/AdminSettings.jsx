import React, { useEffect, useRef, useState } from 'react';
import * as MUI from '@mui/material';
import axios from 'axios';
import SyncIcon from '@mui/icons-material/Sync';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

const AdminSettings = () => {
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [syncProgress, setSyncProgress] = useState(null);
  const pollIntervalRef = useRef(null);

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5174';

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const fetchProgress = async () => {
    try {
      const response = await axios.get(`${apiBase}/api/skins/sync/status`, {
        withCredentials: true
      });
      const progress = response.data?.data;
      setSyncProgress(progress);

      if (progress?.status && progress.status !== 'running') {
        stopPolling();
      }
      return progress;
    } catch (error) {
      console.error('Failed to fetch sync status:', error);
      return null;
    }
  };

  const startPolling = () => {
    if (pollIntervalRef.current) return;
    pollIntervalRef.current = setInterval(fetchProgress, 2000);
  };

  const handleSyncSkins = async () => {
    setSyncLoading(true);
    setSyncResult(null);
    setSyncProgress(null);
    startPolling();
    try {
      const response = await axios.post(
        `${apiBase}/api/skins/sync`,
        {},
        { withCredentials: true }
      );
      
      setSyncResult({
        success: true,
        data: response.data.data
      });
      await fetchProgress(); // ensure final status captured
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncResult({
        success: false,
        message: error.response?.data?.error || error.message
      });
    } finally {
      setSyncLoading(false);
      stopPolling();
    }
  };

  useEffect(() => {
    return () => stopPolling();
  }, []);

  return (
    <MUI.Box>
      <MUI.Typography variant="title_text" gutterBottom>
        Admin Settings
      </MUI.Typography>

      <MUI.Paper 
        variant="outlined" 
        sx={{ 
          p: 3, 
          bgcolor: 'background.paper',
          borderColor: 'divider'
        }}
      >
        <MUI.Stack direction="row" alignItems="center" gap={2} mb={2}>
          <MUI.Typography variant="h6" fontWeight="bold">
            Skin Database Synchronization
          </MUI.Typography>
        </MUI.Stack>

        <MUI.Button 
          variant="contained" 
          color="primary" 
          startIcon={syncLoading ? <MUI.CircularProgress size={20} color="inherit" /> : <SyncIcon />}
          onClick={handleSyncSkins}
          disabled={syncLoading}
          sx={{ fontWeight: 'bold' }}
        >
          {syncLoading ? 'Syncing...' : 'Sync'}
        </MUI.Button>

        {syncProgress && (
          <MUI.Box mt={3} p={2} borderRadius={1} border={`1px solid ${syncProgress.status === 'error' ? '#f44336' : 'rgba(0,0,0,0.12)'}`}>
            <MUI.Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
              <MUI.Typography variant="subtitle1" fontWeight="bold">
                Sync Progress ({syncProgress.status})
              </MUI.Typography>
              <MUI.Typography variant="caption" color="text.secondary">
                Champions: {syncProgress.processedChampions}/{syncProgress.totalChampions}
              </MUI.Typography>
            </MUI.Stack>
            <MUI.LinearProgress
              variant="determinate"
              value={Math.min(100, (syncProgress.processedChampions / (syncProgress.totalChampions || 1)) * 100)}
            />
          </MUI.Box>
        )}

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
                      Errors: {syncResult.data.errors?.length || 0}
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

