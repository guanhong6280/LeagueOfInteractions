import React, { memo, useState } from 'react';
import * as MUI from '@mui/material';
import {
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon
} from '@mui/icons-material';

// --- Neo-Brutalist Design Components ---

export const NeoSelect = ({ value, onChange, options, minWidth = 150, width, startAdornment = null }) => (
  <MUI.Select 
    value={value}
    onChange={onChange}
    IconComponent={KeyboardArrowDownIcon}
    displayEmpty
    startAdornment={startAdornment}
    sx={{
      minWidth: minWidth,
      width: width, // Allow explicit width override
      height: 40,
      bgcolor: 'white',
      borderRadius: 0,
      border: '2px solid black',
      boxShadow: '4px 4px 0px black',
      fontWeight: 'bold',
      fontSize: '0.875rem',
      '& .MuiSelect-select': {
        py: 1,
        px: 2,
        display: 'flex',
        alignItems: 'center',
      },
      '& .MuiSvgIcon-root': {
        color: 'black',
        // right: 12,
      },
      '& fieldset': { border: 'none' },
      '&:hover': {
        bgcolor: '#f0f0f0',
        boxShadow: '5px 5px 0px black',
        transform: 'translate(-1px, -1px)',
      },
      transition: 'all 0.1s',
    }}
    MenuProps={{
      MenuListProps: {
        disablePadding: true,
      },
      PaperProps: {
        sx: {
          border: '2px solid black',
          borderRadius: 0,
          boxShadow: '4px 4px 0px black',
          mt: 1,
          '& .MuiMenuItem-root': {
            fontWeight: 'bold',
            fontSize: '0.875rem',
            '&:hover': {
              bgcolor: '#f0f0f0',
            },
            '&.Mui-selected': {
              bgcolor: '#80D8FF',
              '&:hover': {
                bgcolor: '#40C4FF',
              },
            },
          },
        },
      },
    }}
  >
    {options.map((opt) => (
      <MUI.MenuItem key={opt.value} value={opt.value}>
        {opt.label}
      </MUI.MenuItem>
    ))}
  </MUI.Select>
);

export const NeoCard = ({ children, sx = {}, bgcolor = 'white', ...props }) => (
  <MUI.Box
    sx={{
      border: '3px solid #000',
      boxShadow: '4px 4px 0px #000',
      bgcolor: bgcolor,
      p: 3,
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'translate(-2px, -2px)',
        boxShadow: '6px 6px 0px #000',
      },
      ...sx
    }}
    {...props}
  >
    {children}
  </MUI.Box>
);

export const NeoButton = ({ 
  children, 
  onClick, 
  color = '#FF9A8B', 
  disabled, 
  sx = {}, 
  size = 'medium', 
  ...props 
}) => {
  const isSmall = size === 'small';

  return (
    <MUI.Button
      onClick={onClick}
      disabled={disabled}
      {...props}
      sx={{
        color: 'black',
        bgcolor: color,
        border: '2px solid #000',
        borderRadius: 0,
        fontWeight: 900,
        textTransform: 'uppercase',
        
        // Dynamic based on size
        minWidth: isSmall ? 'auto' : undefined,
        px: isSmall ? 1.5 : 2, // Default MUI padding is roughly 2 (16px) or 6px 16px
        py: isSmall ? 0.5 : 1, // Default MUI padding
        fontSize:  isSmall ? '0.70rem' : '0.875rem',
        boxShadow: isSmall ? '2px 2px 0px #000' : '4px 4px 0px #000',
        
        transition: 'all 0.1s ease',
        '&:hover': {
          bgcolor: color,
          filter: 'brightness(1.1)',
          transform: isSmall ? 'translate(-1px, -1px)' : 'translate(-2px, -2px)',
          boxShadow: isSmall ? '3px 3px 0px #000' : '6px 6px 0px #000',
        },
        '&:active': {
          transform: isSmall ? 'translate(0, 0)' : 'translate(2px, 2px)',
          boxShadow: isSmall ? '1px 1px 0px #000' : '0px 0px 0px #000',
        },
        '&:disabled': {
          bgcolor: '#e0e0e0',
          color: '#9e9e9e',
          boxShadow: 'none',
          border: '2px solid #9e9e9e',
          pointerEvents: 'none',
        },
        // Allow overrides (this handles specific hover colors if passed in sx)
        ...sx
      }}
    >
      {children}
    </MUI.Button>
  );
};

export const FilterChip = memo(({ label, active, onClick, color = 'white' }) => (
  <MUI.Box
    onClick={onClick}
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      px: 2,
      py: 1,
      border: '2px solid black',
      bgcolor: active ? color : 'white',
      color: 'black',
      cursor: 'pointer',
      fontWeight: 'bold',
      fontSize: '0.875rem',
      textTransform: 'uppercase',
      boxShadow: active ? '2px 2px 0px black' : 'none',
      transition: 'all 0.1s',
      '&:hover': {
        transform: 'translate(-1px, -1px)',
        boxShadow: '3px 3px 0px black',
        bgcolor: active ? color : '#f0f0f0',
      },
    }}
  >
    {label}
  </MUI.Box>
));

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

export const NeoSectionTitle = ({ children, bgcolor = 'white', sx = {}, ...props }) => (
  <MUI.Box
    sx={{
      display: 'inline-block',
      border: '2px solid black',
      boxShadow: '2px 2px 0px black',
      bgcolor: bgcolor,
      px: 2,
      py: 1,
      mb: 3,
      ...sx
    }}
  >
    <MUI.Typography
      variant="h6"
      fontWeight="900"
      sx={{
        textTransform: 'uppercase',
      }}
      {...props}
    >
      {children}
    </MUI.Typography>
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
          width: `${(value / 10) * 100}%`,
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
