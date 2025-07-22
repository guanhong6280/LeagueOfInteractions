import React, { useState, memo } from 'react';
import * as MUI from '@mui/material';
import { 
  Send as SendIcon
} from '@mui/icons-material';
import { useAuth } from '../../../../AuthProvider';

const InlineCommentForm = memo(({ 
  onSubmit,
  isSubmitting,
  error,
  onClearError
}) => {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!commentText.trim()) return;

    const result = await onSubmit(commentText);
    
    if (result?.success) {
      setCommentText('');
      setShowSuccessMessage(result.message);
      
      // Clear success message after 2 seconds
      setTimeout(() => setShowSuccessMessage(''), 2000);
    }
  };

  const handleInputChange = (e) => {
    setCommentText(e.target.value);
    if (error) {
      onClearError();
    }
  };

  const characterCount = commentText.length;
  const isOverLimit = characterCount > 1000;
  const hasText = commentText.trim().length > 0;

  if (!user) {
    return (
      <MUI.Box sx={{ p: 2, textAlign: 'center', bgcolor: 'action.hover', borderRadius: 1 }}>
        <MUI.Typography variant="body2" color="text.secondary">
          Sign in to join the discussion
        </MUI.Typography>
      </MUI.Box>
    );
  }

  return (
    <MUI.Box>
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

      {/* Error Message */}
      {error && (
        <MUI.Alert 
          severity="error" 
          sx={{ mb: 2 }} 
          onClose={onClearError}
        >
          {error}
        </MUI.Alert>
      )}

      {/* Inline Comment Form */}
      <MUI.Paper 
        elevation={1} 
        sx={{ 
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <form onSubmit={handleSubmit}>
          <MUI.Box display="flex" alignItems="center" gap={1}>

            {/* Input Field */}
            <MUI.Box sx={{ flex: 1 }}>
              <MUI.TextField
                fullWidth
                multiline
                maxRows={4}
                value={commentText}
                onChange={handleInputChange}
                placeholder="Type your comment here..."
                disabled={isSubmitting}
                error={isOverLimit}
                variant="outlined"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: '0.875rem',
                    '&:hover': {
                      bgcolor: 'background.paper',
                    },
                    '&.Mui-focused': {
                      bgcolor: 'background.paper',
                    },
                    '& fieldset': {
                      border: 'none',
                    },
                  },
                  '& .MuiOutlinedInput-input': {
                    py: 1.5,
                  },
                }}
              />
              
              {/* Character Count & Error */}
              {(isOverLimit || characterCount > 800) && (
                <MUI.Typography 
                  variant="caption" 
                  color={isOverLimit ? 'error' : 'warning.main'}
                  sx={{ display: 'block', mt: 0.5, ml: 1 }}
                >
                  {isOverLimit 
                    ? `${characterCount - 1000} characters over limit`
                    : `${1000 - characterCount} characters remaining`
                  }
                </MUI.Typography>
              )}
            </MUI.Box>

            {/* Send Button */}
            <MUI.IconButton
              type="submit"
              disabled={isSubmitting || !hasText || isOverLimit}
              sx={{
                marginRight: '10px',
                bgcolor: hasText && !isOverLimit && !isSubmitting ? 'primary.main' : 'action.disabledBackground',
                color: hasText && !isOverLimit && !isSubmitting ? 'primary.contrastText' : 'action.disabled',
                '&:hover': {
                  bgcolor: hasText && !isOverLimit && !isSubmitting ? 'primary.dark' : 'action.disabledBackground',
                },
                '&.Mui-disabled': {
                  bgcolor: 'action.disabledBackground',
                  color: 'action.disabled',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              {isSubmitting ? (
                <MUI.CircularProgress size={20} color="inherit" />
              ) : (
                <SendIcon fontSize="small" />
              )}
            </MUI.IconButton>
          </MUI.Box>
        </form>
      </MUI.Paper>
    </MUI.Box>
  );
});

InlineCommentForm.displayName = 'InlineCommentForm';

export default InlineCommentForm; 