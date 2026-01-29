import React, { useMemo } from 'react';
import * as MUI from '@mui/material';
import ToxicitySpamCard from './common/ToxicitySpamCard';
import { getSkinImageUrl } from '../../../common/rating_system/utils/getSkinImageUrl';

const formatDate = (value) => {
  try {
    if (!value) return 'Unknown date';
    return new Date(value).toLocaleString();
  } catch (error) {
    return value || 'Unknown date';
  }
};

const CommentModerationCard = ({
  comment,
  skin,
  champion,
  post,
  subjectType = 'skin',
  thresholds,
  onApprove,
  onReject,
  isProcessing = false,
}) => {
  const avatarLabel = useMemo(() => {
    if (!comment?.username) return '?';
    return comment.username.slice(0, 2).toUpperCase();
  }, [comment?.username]);

  const subjectImage = useMemo(() => {
    if (subjectType === 'champion' && champion?.representativeSkin) {
      return getSkinImageUrl(champion.representativeSkin);
    }
    if (subjectType === 'skin' && skin) {
      return getSkinImageUrl(skin);
    }
    // Posts don't have images, return null
    if (subjectType === 'post') {
      return null;
    }
    return null;
  }, [skin, champion, subjectType]);

  const subjectName = useMemo(() => {
    if (subjectType === 'champion') {
      return champion?.championId || 'Unknown Champion';
    }
    if (subjectType === 'post') {
      return post?.title || 'Unknown Post';
    }
    return skin?.name || 'Unknown Skin';
  }, [skin, champion, post, subjectType]);

  return (
    <MUI.Box
      display="flex"
      gap="10px"
      padding="20px"
      borderRadius="10px"
      border="1px solid #e0e0e0"
      bgcolor="black"
    >
      {/* Comment Information */}
      <MUI.Avatar
        sx={{ marginTop: '8px', width: 48, height: 48 }}
        src={comment?.profilePictureURL || undefined}
      >
        {avatarLabel}
      </MUI.Avatar>
      <MUI.Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        flex={1}
      >
        <MUI.Stack gap="2px">
          <MUI.Box
            display="flex"
            alignItems="center"
            gap="10px"
          >
            <MUI.Typography color="white">{comment?.username || 'Unknown user'}</MUI.Typography>
            <MUI.Typography variant="date_text" color="#878787">
              {formatDate(comment?.createdAt)}
            </MUI.Typography>
            {subjectType === 'champion' && (
              <MUI.Chip 
                label="Champion Comment" 
                size="small" 
                color="secondary" 
                variant="outlined" 
              />
            )}
            {subjectType === 'post' && (
              <MUI.Chip 
                label="Post Comment" 
                size="small" 
                color="primary" 
                variant="outlined" 
              />
            )}
          </MUI.Box>

          <MUI.Box display="flex" gap="10px">
            <ToxicitySpamCard
              title="Toxicity"
              value={comment?.toxicityScore ?? 0}
              thresholds={thresholds?.toxicity}
            />
            <ToxicitySpamCard
              title="Spam"
              value={comment?.spamScore ?? 0}
              thresholds={thresholds?.spam}
            />
          </MUI.Box>

          <MUI.Typography variant="body2" color="white">
            {comment?.comment || 'No comment text available.'}
          </MUI.Typography>
        </MUI.Stack>

        {/* Subject (Skin, Champion, or Post) Information */}
        <MUI.Stack gap="10px" sx={{ minWidth: '200px' }}>
          <MUI.Typography color="white" fontWeight="bold">
            {subjectName}
          </MUI.Typography>
          {subjectType === 'post' && post && (
            <MUI.Stack gap="4px">
              <MUI.Typography variant="caption" color="#878787">
                Patch: {post.patchVersion || 'N/A'}
              </MUI.Typography>
              {post.selectedChampion && (
                <MUI.Typography variant="caption" color="#878787">
                  Champion: {post.selectedChampion}
                </MUI.Typography>
              )}
              {post.selectedGameMode && (
                <MUI.Typography variant="caption" color="#878787">
                  Mode: {post.selectedGameMode}
                </MUI.Typography>
              )}
              <MUI.Typography 
                variant="caption" 
                color="#878787"
                sx={{
                  mt: 1,
                  maxWidth: '200px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {post.body || 'No body text'}
              </MUI.Typography>
            </MUI.Stack>
          )}
          {subjectType !== 'post' && (
            <MUI.Box display="flex">
              {subjectImage ? (
                <MUI.Box
                  component="img"
                  src={subjectImage}
                  alt={subjectName}
                  sx={{
                    width: '200px',
                    height: '100px',
                    objectFit: 'cover',
                    borderRadius: '10px',
                  }}
                />
              ) : (
                <MUI.Box
                  width="200px"
                  height="100px"
                  borderRadius="10px"
                  border="1px dashed #e0e0e0"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <MUI.Typography variant="body2" color="white">No preview</MUI.Typography>
                </MUI.Box>
              )}
            </MUI.Box>
          )}
        </MUI.Stack>

        {/* Action area */}
        <MUI.Stack gap="10px">
          <MUI.Button
            variant="contained"
            onClick={onApprove}
            disabled={isProcessing}
            sx={{
              backgroundColor: '#ffffff',
              color: '#000000',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: '#e0e0e0',
              },
            }}
          >
            Approve
          </MUI.Button>
          <MUI.Button
            variant="outlined"
            onClick={onReject}
            disabled={isProcessing}
            sx={{
              borderColor: '#ffffff',
              color: '#ffffff',
              '&:hover': {
                borderColor: '#ffffff',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Reject
          </MUI.Button>
        </MUI.Stack>
      </MUI.Box>
    </MUI.Box>
  );
};

export default CommentModerationCard;
