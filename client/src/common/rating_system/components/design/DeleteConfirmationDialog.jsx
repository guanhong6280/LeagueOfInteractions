import React from 'react';
import * as MUI from '@mui/material';
import { NeoButton } from './NeoComponents';

/**
 * Reusable Delete Confirmation Dialog Component
 * Neo-brutalist style confirmation dialog for deleting items
 * 
 * @param {boolean} open - Whether the dialog is open
 * @param {function} onClose - Function to call when dialog is closed
 * @param {function} onConfirm - Function to call when delete is confirmed
 * @param {string} itemType - Type of item being deleted (e.g., 'Post', 'Comment', 'Reply')
 * @param {string} itemName - Optional specific name/identifier for the item
 * @param {ReactNode} warningMessage - Optional additional warning message to display
 * @param {boolean} isDeleting - Whether the delete action is in progress
 */
const DeleteConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
  itemType = 'Item',
  itemName,
  warningMessage,
  isDeleting = false,
}) => {
  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <MUI.Dialog
      open={open}
      onClose={handleCancel}
      PaperProps={{
        sx: {
          borderRadius: 0,
          border: '3px solid black',
          boxShadow: '8px 8px 0px black',
          minWidth: 400,
        }
      }}
    >
      <MUI.DialogTitle sx={{ fontWeight: 900, textTransform: 'uppercase', borderBottom: '2px solid black' }}>
        Delete {itemType}?
      </MUI.DialogTitle>
      <MUI.DialogContent sx={{ mt: 2 }}>
        <MUI.Typography variant="body1" fontWeight="bold">
          Are you sure you want to delete this {itemType.toLowerCase()}
          {itemName ? ` "${itemName}"` : ''}? This action cannot be undone.
        </MUI.Typography>
        {warningMessage && (
          <MUI.Typography variant="body2" fontWeight="bold" color="error.main" sx={{ mt: 2 }}>
            {warningMessage}
          </MUI.Typography>
        )}
      </MUI.DialogContent>
      <MUI.DialogActions sx={{ p: 2, gap: 1 }}>
        <NeoButton
          onClick={handleCancel}
          disabled={isDeleting}
          color="white"
          sx={{
            '&:hover': {
              bgcolor: '#f0f0f0',
            },
            boxShadow: '4px 4px 0px black',
          }}
        >
          Cancel
        </NeoButton>
        <NeoButton
          onClick={handleConfirm}
          disabled={isDeleting}
          color="#EF5350"
          sx={{
            color: 'white',
            '&:hover': {
              bgcolor: '#E53935',
            },
            boxShadow: '4px 4px 0px black',
          }}
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </NeoButton>
      </MUI.DialogActions>
    </MUI.Dialog>
  );
};

export default DeleteConfirmationDialog;
