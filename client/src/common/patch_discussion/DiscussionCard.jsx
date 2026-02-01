import React from 'react';
import * as MUI from '@mui/material';
import {
  ChatBubble as ChatBubbleIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { NeoBadge } from '../rating_system/components/design/NeoComponents';
import LikeButton from '../button/LikeButton';
import { formatRelativeDateUpper } from '../../utils/dateUtils';
import theme from '../../theme/theme';

const DiscussionCard = ({ post, onClick }) => {
  const {
    title,
    body,
    user,
    patchVersion,
    selectedChampion = null,
    selectedGameMode = null,
    likeCount = 0,
    commentCount = 0,
    createdAt,
  } = post;

  // Truncate body for preview
  const bodyPreview = body?.length > 200 ? `${body.substring(0, 200)}...` : body;

  return (
    <MUI.Box
      onClick={onClick}
      sx={{
        border: '3px solid #000',
        boxShadow: '6px 6px 0px #000',
        bgcolor: 'white',
        p: 3,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        '&:hover': {
          transform: 'translate(-2px, -2px)',
          boxShadow: '8px 8px 0px #000',
          bgcolor: '#fafafa',
        },
      }}
    >
      {/* Header with Patch Version */}
      <MUI.Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <MUI.Box
          sx={{
            bgcolor: '#FFEB3B',
            border: '2px solid #000',
            px: 1.5,
            py: 0.5,
            fontWeight: 900,
            fontSize: '0.75rem',
            boxShadow: '2px 2px 0px #000',
          }}
        >
          PATCH {patchVersion}
        </MUI.Box>
        
        <MUI.Typography
          variant="caption"
          sx={{
            fontFamily: 'monospace',
            fontWeight: 'bold',
            color: 'text.secondary',
          }}
        >
          {formatRelativeDateUpper(createdAt)}
        </MUI.Typography>
      </MUI.Box>

      {/* Title */}
      <MUI.Typography
        variant="h5"
        sx={{
          fontWeight: 900,
          mb: 2,
          fontSize: { xs: '1.2rem', md: '1.5rem' },
          lineHeight: 1.2,
          wordBreak: 'break-word',
        }}
      >
        {title}
      </MUI.Typography>

      {/* Body Preview */}
      <MUI.Typography
        variant="body2"
        sx={{
          mb: 2,
          color: 'text.secondary',
          lineHeight: 1.6,
          wordBreak: 'break-word',
        }}
      >
        {bodyPreview}
      </MUI.Typography>

      {/* Selected Champion & Game Mode */}
      {(selectedChampion || selectedGameMode) && (
        <MUI.Box mb={2} display="flex" flexWrap="wrap" gap={1}>
          {selectedChampion && (
            <NeoBadge label={selectedChampion} color={theme.palette.button.redSide} />
          )}
          {selectedGameMode && (
            <NeoBadge label={selectedGameMode} color={theme.palette.button.blueSide} />
          )}
        </MUI.Box>
      )}

      {/* Divider */}
      <MUI.Box
        sx={{
          height: '2px',
          bgcolor: 'black',
          mb: 2,
        }}
      />

      {/* Footer with Author and Stats */}
      <MUI.Box display="flex" justifyContent="space-between" alignItems="center">
        {/* Author Info */}
        <MUI.Box display="flex" alignItems="center" gap={1.5}>
          {user?.profilePictureURL ? (
            <MUI.Avatar
              src={user.profilePictureURL}
              alt={user.username}
              sx={{
                width: 32,
                height: 32,
                border: '2px solid #000',
                borderRadius: 0,
              }}
            />
          ) : (
            <MUI.Box
              sx={{
                width: 32,
                height: 32,
                border: '2px solid #000',
                bgcolor: '#E0E0E0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PersonIcon sx={{ fontSize: 20 }} />
            </MUI.Box>
          )}
          
          <MUI.Box>
            <MUI.Typography
              variant="body2"
              sx={{
                fontWeight: 900,
                lineHeight: 1.2,
              }}
            >
              {user?.username || 'Anonymous'}
            </MUI.Typography>
          </MUI.Box>
        </MUI.Box>

        {/* Stats */}
        <MUI.Box display="flex" gap={1}>
          <LikeButton
            isLiked={false} // Preview cards don't show user's like state usually, or pass it if available
            likeCount={likeCount}
            sx={{ pointerEvents: 'none' }} // Non-interactive
          />
          
          <MUI.Button
            size="small"
            startIcon={<ChatBubbleIcon sx={{ fontSize: 16 }} />}
            sx={{
              minWidth: 'auto',
              px: 1.5,
              py: 0.5,
              border: '2px solid black',
              borderRadius: 0,
              bgcolor: 'white',
              color: 'black',
              fontWeight: 900,
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              boxShadow: '2px 2px 0px black',
              transition: 'all 0.1s ease-in-out',
              '&:hover': {
                bgcolor: '#F5F5F5',
                transform: 'translate(-1px, -1px)',
                boxShadow: '3px 3px 0px black',
              },
              pointerEvents: 'none', // Not clickable in card preview
            }}
          >
            {commentCount}
          </MUI.Button>
        </MUI.Box>
      </MUI.Box>
    </MUI.Box>
  );
};

export default DiscussionCard;
