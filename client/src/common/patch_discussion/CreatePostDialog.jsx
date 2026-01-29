import React, { useState } from 'react';
import * as MUI from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { NeoButton, FilterChip } from '../rating_system/components/design/NeoComponents';
import { useChampionNames } from '../../hooks/useChampionNames';

const GAME_MODES = [
  'Ranked Solo/Duo',
  'Ranked Flex',
  'Swift Play',
  'Draft Pick',
  'ARAM',
  'ARAM Mayhem',
  'Arena',
  'Ultimate Spellbook',
  'URF',
];

const CreatePostDialog = ({ open, onClose, onSubmit }) => {
  const { data: championNames = [] } = useChampionNames();
  
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    selectedChampion: '',
    selectedGameMode: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const selectGameMode = (mode) => {
    setFormData(prev => ({
      ...prev,
      selectedGameMode: prev.selectedGameMode === mode ? '' : mode
    }));
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.title.trim() || formData.title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }
    
    if (formData.title.trim().length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }
    
    if (!formData.body.trim() || formData.body.trim().length < 10) {
      newErrors.body = 'Body must be at least 10 characters';
    }
    
    if (formData.body.trim().length > 5000) {
      newErrors.body = 'Body must be less than 5000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(formData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      body: '',
      selectedChampion: '',
      selectedGameMode: '',
    });
    setErrors({});
    onClose();
  };

  return (
    <MUI.Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          border: '3px solid #000',
          boxShadow: '8px 8px 0px #000',
          borderRadius: 0,
          bgcolor: 'white',
        }
      }}
    >
      {/* Header */}
      <MUI.Box
        sx={{
          bgcolor: '#FFEB3B',
          border: '3px solid #000',
          borderLeft: 'none',
          borderRight: 'none',
          borderTop: 'none',
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <MUI.Typography
          variant="h5"
          sx={{
            fontWeight: 900,
            textTransform: 'uppercase',
          }}
        >
          Create New Post
        </MUI.Typography>
        <MUI.IconButton
          onClick={handleClose}
          sx={{
            border: '2px solid #000',
            borderRadius: 0,
            bgcolor: 'white',
            '&:hover': { bgcolor: '#f0f0f0' },
          }}
        >
          <CloseIcon />
        </MUI.IconButton>
      </MUI.Box>

      {/* Content */}
      <MUI.DialogContent sx={{ p: 3 }}>
        {/* Title Input */}
        <MUI.Box mb={3}>
          <MUI.Typography
            variant="subtitle2"
            fontWeight="bold"
            gutterBottom
            textTransform="uppercase"
          >
            Title *
          </MUI.Typography>
          <MUI.TextField
            fullWidth
            placeholder="Enter post title..."
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            error={!!errors.title}
            helperText={errors.title || `${formData.title.length}/200`}
            InputProps={{
              sx: {
                borderRadius: 0,
                border: '2px solid black',
                fontWeight: 'bold',
                '& fieldset': { border: 'none' },
              }
            }}
          />
        </MUI.Box>

        {/* Body Input */}
        <MUI.Box mb={3}>
          <MUI.Typography
            variant="subtitle2"
            fontWeight="bold"
            gutterBottom
            textTransform="uppercase"
          >
            Body *
          </MUI.Typography>
          <MUI.TextField
            fullWidth
            multiline
            rows={6}
            placeholder="Share your thoughts about the patch..."
            value={formData.body}
            onChange={(e) => handleChange('body', e.target.value)}
            error={!!errors.body}
            helperText={errors.body || `${formData.body.length}/5000`}
            InputProps={{
              sx: {
                borderRadius: 0,
                border: '2px solid black',
                fontWeight: 'normal',
                '& fieldset': { border: 'none' },
              }
            }}
          />
        </MUI.Box>

        {/* Champion Select */}
        <MUI.Box mb={3}>
          <MUI.Typography
            variant="subtitle2"
            fontWeight="bold"
            gutterBottom
            textTransform="uppercase"
          >
            Champion (Optional)
          </MUI.Typography>
          <MUI.FormControl fullWidth>
            <MUI.Select
              value={formData.selectedChampion}
              onChange={(e) => handleChange('selectedChampion', e.target.value)}
              displayEmpty
              sx={{
                borderRadius: 0,
                border: '2px solid black',
                fontWeight: 'bold',
                backgroundColor: 'white',
                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                '&:hover': { backgroundColor: '#fff' },
                boxShadow: '3px 3px 0px 0px rgba(0,0,0,0.2)',
                textTransform: 'uppercase',
                height: '45px',
                fontSize: '1rem',
              }}
              renderValue={(selected) => {
                if (!selected) {
                  return (
                    <MUI.Typography sx={{ color: 'gray', fontWeight: 'bold', fontSize: '1rem' }}>
                      SELECT CHAMPION
                    </MUI.Typography>
                  );
                }
                return selected;
              }}
            >
              <MUI.MenuItem value="" sx={{ fontWeight: 'bold', fontStyle: 'italic' }}>
                <em>None</em>
              </MUI.MenuItem>
              {championNames.map((name) => (
                <MUI.MenuItem key={name} value={name} sx={{ fontWeight: 'bold' }}>
                  {name}
                </MUI.MenuItem>
              ))}
            </MUI.Select>
          </MUI.FormControl>
        </MUI.Box>

        {/* Game Mode */}
        <MUI.Box>
          <MUI.Typography
            variant="subtitle2"
            fontWeight="bold"
            gutterBottom
            textTransform="uppercase"
          >
            Game Mode (Optional - Select One)
          </MUI.Typography>
          <MUI.Box display="flex" flexWrap="wrap" gap={1}>
            {GAME_MODES.map((mode) => (
              <FilterChip
                key={mode}
                label={mode}
                active={formData.selectedGameMode === mode}
                onClick={() => selectGameMode(mode)}
                color="#A5D6A7"
              />
            ))}
          </MUI.Box>
        </MUI.Box>
      </MUI.DialogContent>

      {/* Footer */}
      <MUI.Box
        sx={{
          borderTop: '3px solid #000',
          p: 2,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 2,
        }}
      >
        <NeoButton
          onClick={handleClose}
          color="#E0E0E0"
          sx={{ minWidth: '100px' }}
        >
          Cancel
        </NeoButton>
        <NeoButton
          onClick={handleSubmit}
          color="#B2FF59"
          sx={{ minWidth: '100px' }}
        >
          Post
        </NeoButton>
      </MUI.Box>
    </MUI.Dialog>
  );
};

export default CreatePostDialog;
