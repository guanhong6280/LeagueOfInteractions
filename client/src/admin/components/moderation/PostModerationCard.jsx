import React, { useMemo } from 'react';
import * as MUI from '@mui/material';
import ToxicitySpamCard from './common/ToxicitySpamCard';

const formatDate = (value) => {
  try {
    if (!value) return 'Unknown date';
    return new Date(value).toLocaleString();
  } catch (error) {
    return value || 'Unknown date';
  }
};

const PostModerationCard = ({
  post,
  thresholds,
  onApprove,
  onReject,
  isProcessing = false,
}) => {
  const avatarLabel = useMemo(() => {
    if (!post?.username) return '?';
    return post.username.slice(0, 2).toUpperCase();
  }, [post?.username]);

  return (
    <MUI.Box
      display="flex"
      gap="10px"
      padding="20px"
      borderRadius="10px"
      border="1px solid #e0e0e0"
      bgcolor="black"
    >
      {/* Post Author Information */}
      <MUI.Avatar
        sx={{ marginTop: '8px', width: 48, height: 48 }}
        src={post?.profilePictureURL || undefined}
      >
        {avatarLabel}
      </MUI.Avatar>
      <MUI.Box
        display="flex"
        flex={1}
        gap="10px"
      >
        {/* Header Section */}
        <MUI.Stack gap="2px" flex={1}>
          <MUI.Box
            display="flex"
            alignItems="center"
            gap="10px"
          >
            <MUI.Typography color="white">
              {post?.username || 'Unknown user'}
            </MUI.Typography>
            <MUI.Typography variant="date_text" color="#878787">
              {formatDate(post?.createdAt)}
            </MUI.Typography>
            {post?.autoModerationFailed && (
              <MUI.Chip
                label="Auto-Mod Failed"
                size="small"
                color="error"
                variant="outlined"
              />
            )}
          </MUI.Box>
          {/* Post Content Section */}
          <MUI.Stack flex={1}>
            <MUI.Typography
              color="white"
            >
              {post?.title || 'No title'}
            </MUI.Typography>

            <MUI.Typography
              variant="body2"
              color="white"
              sx={{
                wordBreak: 'break-word',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.6,
              }}
            >
              {post?.body || 'No content available.'}
            </MUI.Typography>
          </MUI.Stack>
          <MUI.Divider sx={{ marginTop: "auto" }} />
          {/* Post Metadata */}
          <MUI.Box
            display="flex"
            justifyContent="space-between"
          >
            {post?.patchVersion && (
              <MUI.Box display="flex" gap="5px" alignItems="center">
                <MUI.Typography variant="caption" color="#878787">
                  Patch:
                </MUI.Typography>
                <MUI.Typography variant="caption" color="white" fontWeight="600">
                  {post.patchVersion}
                </MUI.Typography>
              </MUI.Box>
            )}
            {post?.selectedChampion && (
              <MUI.Box display="flex" gap="5px" alignItems="center">
                <MUI.Typography variant="caption" color="#878787">
                  Champion:
                </MUI.Typography>
                <MUI.Typography variant="caption" color="white" fontWeight="600">
                  {post.selectedChampion}
                </MUI.Typography>
              </MUI.Box>
            )}
            {post?.selectedGameMode && (
              <MUI.Box display="flex" gap="5px" alignItems="center">
                <MUI.Typography variant="caption" color="#878787">
                  Mode:
                </MUI.Typography>
                <MUI.Typography variant="caption" color="white" fontWeight="600">
                  {post.selectedGameMode}
                </MUI.Typography>
              </MUI.Box>
            )}
          </MUI.Box>
        </MUI.Stack>
        <MUI.Divider orientation="vertical" flexItem />
        <MUI.Stack gap="6px">
          <MUI.Stack>
            <ToxicitySpamCard
              title="Toxicity"
              value={post?.toxicityScore ?? 0}
              thresholds={thresholds?.toxicity}
            />
            <ToxicitySpamCard
              title="Spam"
              value={post?.spamScore ?? 0}
              thresholds={thresholds?.spam}
            />
          </MUI.Stack>

          <MUI.Box display="flex" gap="10px">
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
          </MUI.Box>
        </MUI.Stack>

      </MUI.Box>
    </MUI.Box>
  );
};

export default PostModerationCard;
