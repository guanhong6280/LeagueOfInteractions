import React, { useState, memo } from 'react';
import * as MUI from '@mui/material';
import { 
  Send as SendIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useAuth } from '../../../../AuthProvider';

const ReplyForm = memo(({ 
  onSubmit,
  onCancel,
  isSubmitting,
  parentCommentId,
  replyingToUsername
}) => {
  const { user } = useAuth();
  const [replyText, setReplyText] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!replyText.trim()) return;

    const result = await onSubmit(parentCommentId, replyText);
    
    if (result?.success) {
      setReplyText('');
      setShowSuccessMessage(result.message);
      
      // Clear success message after 2 seconds
      setTimeout(() => {
        setShowSuccessMessage('');
        onCancel(); // Auto-close form after successful submission
      }, 2000);
    }
  };

  const handleCancel = () => {
    setReplyText('');
    onCancel();
  };

  const characterCount = replyText.length;
  const isOverLimit = characterCount > 500;
  const isNearLimit = characterCount > 400;

  if (!user) {
    return null; // Should not render if user is not authenticated
  }

  return (
    <MUI.Box sx={{ mt: 1.5, pl: 4 }}>
      {/* Success Message */}
      {showSuccessMessage && (
        <MUI.Alert 
          severity="success" 
          sx={{ mb: 2 }} 
          onClose={() => setShowSuccessMessage('')}
        >
          {showSuccessMessage}
        </MUI.Alert>
      )}

      {/* TikTok-style reply form */}
      <MUI.Box 
        sx={{ 
          p: 1.5, 
          bgcolor: 'action.hover',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        {/* TikTok-style Reply Header */}
        <MUI.Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
          <MUI.Avatar
            src={user.profilePictureURL}
            alt={user.username}
            sx={{ width: 24, height: 24 }}
          >
            {user.username?.charAt(0).toUpperCase()}
          </MUI.Avatar>
          <MUI.Box>
            <MUI.Typography variant="body2" fontWeight="bold" sx={{ fontSize: '0.8rem' }}>
              {user.username}
            </MUI.Typography>
            <MUI.Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              Replying to @{replyingToUsername}
            </MUI.Typography>
          </MUI.Box>
        </MUI.Box>

        {/* Reply Form */}
        <form onSubmit={handleSubmit}>
          <MUI.TextField
            fullWidth
            multiline
            rows={3}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a thoughtful reply..."
            disabled={isSubmitting}
            error={isOverLimit}
            helperText={
              isOverLimit 
                ? `Reply exceeds ${characterCount - 500} characters over the 500 limit`
                : isNearLimit 
                ? `${500 - characterCount} characters remaining`
                : `${characterCount}/500 characters`
            }
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                bgcolor: 'background.paper',
                fontSize: '0.875rem',
              },
            }}
          />

          {/* Form Actions */}
          <MUI.Box display="flex" justifyContent="space-between" alignItems="center">
            <MUI.Typography 
              variant="caption" 
              color={isOverLimit ? 'error' : isNearLimit ? 'warning.main' : 'text.secondary'}
            >
              {characterCount}/500
            </MUI.Typography>

            <MUI.Box display="flex" gap={1}>
              <MUI.Button
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                variant="outlined"
                size="small"
                disabled={isSubmitting}
                sx={{ textTransform: 'none' }}
              >
                Cancel
              </MUI.Button>
              
              <MUI.Button
                type="submit"
                startIcon={isSubmitting ? <MUI.CircularProgress size={16} /> : <SendIcon />}
                disabled={isSubmitting || !replyText.trim() || isOverLimit}
                variant="contained"
                size="small"
                sx={{ 
                  textTransform: 'none',
                  minWidth: '100px'
                }}
              >
                {isSubmitting ? 'Posting...' : 'Post Reply'}
              </MUI.Button>
            </MUI.Box>
          </MUI.Box>
        </form>
      </MUI.Box>
    </MUI.Box>
  );
});

ReplyForm.displayName = 'ReplyForm';

export default ReplyForm; 