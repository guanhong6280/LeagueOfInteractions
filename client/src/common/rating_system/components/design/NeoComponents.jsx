import React, { memo, useState } from 'react';
import * as MUI from '@mui/material';
import {
  Error as ErrorIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// --- Neo-Brutalist Design Components ---

export const NeoCard = ({ children, sx = {}, bgcolor = 'white' }) => (
  <MUI.Box
    sx={{
      border: '3px solid #000',
      boxShadow: '8px 8px 0px #000',
      bgcolor: bgcolor,
      p: 3,
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'translate(-2px, -2px)',
        boxShadow: '10px 10px 0px #000',
      },
      ...sx
    }}
  >
    {children}
  </MUI.Box>
);

export const NeoBadge = ({ label, color = '#A5D6A7' }) => (
  <MUI.Box
    component="span"
    sx={{
      display: 'inline-block',
      border: '2px solid #000',
      bgcolor: color,
      px: 2,
      py: 0.5,
      fontWeight: 900,
      textTransform: 'uppercase',
      fontSize: '0.8rem',
      boxShadow: '2px 2px 0px #000',
      mr: 1,
      mb: 1
    }}
  >
    {label}
  </MUI.Box>
);

export const StatBar = ({ label, value, color = '#2196F3', icon: Icon }) => (
  <MUI.Box mb={2}>
    <MUI.Box display="flex" alignItems="center" mb={0.5} justifyContent="space-between">
      <MUI.Box display="flex" alignItems="center" gap={1}>
        {Icon && <Icon sx={{ fontSize: 20 }} />}
        <MUI.Typography fontWeight="900" variant="body2" textTransform="uppercase">
          {label}
        </MUI.Typography>
      </MUI.Box>
      <MUI.Typography fontWeight="900" variant="body2">
        {value ? value.toFixed(1) : 'N/A'}
      </MUI.Typography>
    </MUI.Box>
    <MUI.Box
      sx={{
        height: 20,
        width: '100%',
        border: '2px solid #000',
        bgcolor: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <MUI.Box
        sx={{
          height: '100%',
          width: `${(value / 5) * 100}%`,
          bgcolor: color,
          borderRight: '2px solid #000',
          transition: 'width 1s ease-in-out'
        }}
      />
    </MUI.Box>
  </MUI.Box>
);

export const StatCard = memo(({
  icon,
  label,
  value,
  color = 'primary',
  imageSrc = null
}) => {
  return (
    <MUI.Card
      sx={{
        p: 2,
        textAlign: 'center',
        bgcolor: 'white',
        minHeight: 120,
        border: '2px solid black',
        boxShadow: '4px 4px 0px black',
        borderRadius: 0,
        transition: 'all 0.1s ease-in-out',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translate(-2px, -2px)',
          boxShadow: '6px 6px 0px black',
        },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <MUI.Box sx={{ mb: 1 }}>
        {imageSrc ? (
          <img src={imageSrc} alt={label} style={{ width: 32, height: 32 }} />
        ) : (
          icon && React.createElement(icon, { sx: { fontSize: 32, color: 'black' } })
        )}
      </MUI.Box>
      <MUI.Typography
        variant="h5"
        fontWeight="900"
        color="black"
        sx={{ mb: 0.5 }}
      >
        {value}
      </MUI.Typography>
      <MUI.Typography
        variant="caption"
        fontWeight="bold"
        color="text.primary"
        textTransform="uppercase"
      >
        {label}
      </MUI.Typography>
    </MUI.Card>
  );
});

export const ChampionImage = memo(({
  imageUrl,
  championName,
  error = null,
  onRetry
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleRetry = () => {
    setImageError(false);
    setImageLoaded(false);
    if (onRetry) onRetry();
  };

  return (
    <MUI.Box
      sx={{
        width: 150,
        height: 150,
        position: 'relative',
        borderRadius: 3,
        overflow: 'hidden',
        border: '3px solid',
        borderColor: 'primary.200',
        bgcolor: 'grey.50',
        boxShadow: 3,
      }}
    >
      {!imageError && imageUrl ? (
        <>
          <MUI.Avatar
            src={imageUrl}
            alt={`${championName} portrait`}
            variant="square"
            sx={{
              width: '100%',
              height: '100%',
              transition: 'opacity 0.3s ease',
              opacity: imageLoaded ? 1 : 0,
            }}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
          {!imageLoaded && (
            <MUI.Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'grey.100',
              }}
            >
              <MUI.CircularProgress size={24} />
            </MUI.Box>
          )}
        </>
      ) : (
        <MUI.Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'grey.100',
            color: 'text.secondary',
          }}
        >
          <ErrorIcon sx={{ fontSize: 32, mb: 1 }} />
          <MUI.Typography variant="caption" textAlign="center">
            Image failed
          </MUI.Typography>
          {onRetry && (
            <MUI.IconButton size="small" onClick={handleRetry} sx={{ mt: 0.5 }}>
              <RefreshIcon fontSize="small" />
            </MUI.IconButton>
          )}
        </MUI.Box>
      )}
    </MUI.Box>
  );
});

