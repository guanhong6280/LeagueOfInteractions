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
        elevation={0} 
        sx={{ 
          bgcolor: 'white',
          border: '3px solid black',
          boxShadow: '6px 6px 0px black',
          p: 2,
          borderRadius: 0,
        }}
      >
        <form onSubmit={handleSubmit}>
          <MUI.Box display="flex" alignItems="center" gap={2}>

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
                    fontSize: '0.9rem',
                    borderRadius: 0,
                    bgcolor: '#f8f8f8',
                    border: '2px solid black',
                    height: '100%', // Ensure input root takes full height
                    alignItems: 'flex-start', // Align text to top
                    '& fieldset': { border: 'none' }, 
                    '&:hover': { bgcolor: '#fff' },
                    '&.Mui-focused': { 
                        bgcolor: '#fff',
                        boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.1)'
                    },
                  },
                  '& .MuiOutlinedInput-input': {
                    py: 1.5,
                    px: 1,
                    fontWeight: 500,
                  },
                }}
              />
              
              {/* Character Count & Error */}
              {(isOverLimit || characterCount > 800) && (
                <MUI.Typography 
                  variant="caption" 
                  fontWeight="bold"
                  color={isOverLimit ? 'error' : 'warning.main'}
                  sx={{ display: 'block', mt: 1, ml: 0.5, textTransform: 'uppercase' }}
                >
                  {isOverLimit 
                    ? `${characterCount - 1000} characters over limit`
                    : `${1000 - characterCount} characters remaining`
                  }
                </MUI.Typography>
              )}
            </MUI.Box>

            {/* Send Button */}
            <MUI.Box display="flex" flexDirection="column">
                <MUI.Button
                type="submit"
                disabled={isSubmitting || !hasText || isOverLimit}
                variant="contained"
                sx={{
                    minWidth: 'auto',
                    width: "50px",
                    height: "50px", // Let flexbox stretch it
                    borderRadius: "50%",
                    border: '2px solid black',
                    bgcolor: hasText && !isOverLimit && !isSubmitting ? '#FF4081' : '#e0e0e0',
                    color: hasText && !isOverLimit && !isSubmitting ? 'white' : '#9e9e9e',
                    boxShadow: hasText && !isOverLimit && !isSubmitting ? '4px 4px 0px black' : 'none',
                    '&:hover': {
                    bgcolor: hasText && !isOverLimit && !isSubmitting ? '#F50057' : '#e0e0e0',
                    transform: hasText && !isOverLimit && !isSubmitting ? 'translate(-2px, -2px)' : 'none',
                    boxShadow: hasText && !isOverLimit && !isSubmitting ? '6px 6px 0px black' : 'none',
                    },
                    '&:active': {
                    transform: 'translate(0, 0)',
                    boxShadow: 'none',
                    },
                    transition: 'all 0.1s ease-in-out',
                    p: 0,
                }}
                >
                {isSubmitting ? (
                    <MUI.CircularProgress size={24} color="inherit" thickness={5} />
                ) : (
                    <SendIcon />
                )}
                </MUI.Button>
                {/* Spacer to match character count height if needed, or just let button stretch */}
            </MUI.Box>
          </MUI.Box>
        </form>
      </MUI.Paper>
    </MUI.Box>
  );
});

InlineCommentForm.displayName = 'InlineCommentForm';

export default InlineCommentForm; 