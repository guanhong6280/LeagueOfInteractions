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
    <MUI.Box sx={{ mt: 2, pl: { xs: 0, sm: 7 } }}>
      {/* Success Message */}
      {showSuccessMessage && (
        <MUI.Alert 
          severity="success" 
          sx={{ mb: 2, border: '2px solid black', borderRadius: 0, boxShadow: '4px 4px 0px black' }} 
          onClose={() => setShowSuccessMessage('')}
        >
          {showSuccessMessage}
        </MUI.Alert>
      )}

      {/* TikTok-style reply form */}
      <MUI.Box 
        sx={{ 
          p: 2, 
          bgcolor: 'white',
          borderRadius: 0,
          border: '3px solid black',
          boxShadow: '6px 6px 0px black'
        }}
      >
        {/* TikTok-style Reply Header */}
        <MUI.Box display="flex" alignItems="center" gap={1.5} mb={2}>
          <MUI.Avatar
            src={user.profilePictureURL}
            alt={user.username}
            sx={{ 
                width: 32, 
                height: 32,
                border: '2px solid black',
                bgcolor: '#E0E0E0',
                color: 'black',
                fontWeight: 'bold'
            }}
          >
            {user.username?.charAt(0).toUpperCase()}
          </MUI.Avatar>
          <MUI.Box>
            <MUI.Typography variant="subtitle2" fontWeight="900" sx={{ fontSize: '0.9rem' }}>
              {user.username}
            </MUI.Typography>
            <MUI.Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
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
            FormHelperTextProps={{
                sx: { fontWeight: 'bold', textTransform: 'uppercase', color: isOverLimit ? 'error.main' : 'text.primary' }
            }}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                bgcolor: '#f8f8f8',
                fontSize: '0.9rem',
                borderRadius: 0,
                border: '2px solid black',
                '& fieldset': { border: 'none' },
                '&:hover': { bgcolor: '#fff' },
                '&.Mui-focused': { bgcolor: '#fff', boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.1)' }
              },
            }}
          />

          {/* Form Actions */}
          <MUI.Box display="flex" justifyContent="flex-end" alignItems="center" gap={1}>
            
            <MUI.Button
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                disabled={isSubmitting}
                sx={{ 
                    textTransform: 'uppercase',
                    fontWeight: 900,
                    borderRadius: 0,
                    border: '2px solid black',
                    color: 'black',
                    bgcolor: 'white',
                    boxShadow: '4px 4px 0px black',
                    '&:hover': {
                        bgcolor: '#f0f0f0',
                        transform: 'translate(-2px, -2px)',
                        boxShadow: '6px 6px 0px black',
                    },
                    '&:active': {
                        transform: 'translate(0, 0)',
                        boxShadow: 'none',
                    },
                    transition: 'all 0.1s'
                }}
            >
                Cancel
            </MUI.Button>
            
            <MUI.Button
                type="submit"
                startIcon={isSubmitting ? <MUI.CircularProgress size={16} color="inherit" /> : <SendIcon />}
                disabled={isSubmitting || !replyText.trim() || isOverLimit}
                sx={{ 
                    textTransform: 'uppercase',
                    fontWeight: 900,
                    borderRadius: 0,
                    border: '2px solid black',
                    color: 'white',
                    bgcolor: 'black',
                    boxShadow: '4px 4px 0px #9e9e9e', // Grey shadow for contrast against white bg
                    '&:hover': {
                        bgcolor: '#333',
                        transform: 'translate(-2px, -2px)',
                        boxShadow: '6px 6px 0px #9e9e9e',
                    },
                    '&:active': {
                        transform: 'translate(0, 0)',
                        boxShadow: 'none',
                    },
                    '&.Mui-disabled': {
                        bgcolor: '#e0e0e0',
                        color: '#9e9e9e',
                        border: '2px solid #9e9e9e',
                        boxShadow: 'none'
                    },
                    transition: 'all 0.1s'
                }}
            >
                {isSubmitting ? 'Posting...' : 'Post Reply'}
            </MUI.Button>
          </MUI.Box>
        </form>
      </MUI.Box>
    </MUI.Box>
  );
});

ReplyForm.displayName = 'ReplyForm';

export default ReplyForm; 