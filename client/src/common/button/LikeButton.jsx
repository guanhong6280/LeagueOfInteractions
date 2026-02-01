import React, { useState, useEffect } from 'react';
import { ThumbUp, ThumbUpOutlined } from '@mui/icons-material';
import { NeoButton } from '../rating_system/components/design/NeoComponents';
import theme from '../../theme/theme';

const LikeButton = ({ 
  isLiked, 
  likeCount, 
  onClick, 
  disabled = false, 
  size = 'small',
  sx = {}
}) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isLiked) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isLiked]);

  return (
    <NeoButton
      size={size}
      onClick={onClick}
      disabled={disabled}
      color={isLiked ? theme.palette.button.like_active : 'white'}
      startIcon={
        isLiked ? (
          <ThumbUp
            sx={{
              fontSize: size === 'small' ? 16 : 20,
              transform: animate ? 'scale(1.3)' : 'scale(1)',
              transition: 'transform 0.2s ease-in-out',
            }}
          />
        ) : (
          <ThumbUpOutlined
            sx={{
              fontSize: size === 'small' ? 16 : 20,
              transform: animate ? 'scale(1.3)' : 'scale(1)',
              transition: 'transform 0.2s ease-in-out'
            }}
          />
        )
      }
      sx={{
        '&:hover': {
          bgcolor: theme.palette.button.like_hover,
        },
        ...sx
      }}
    >
      {likeCount}
    </NeoButton>
  );
};

export default LikeButton;
