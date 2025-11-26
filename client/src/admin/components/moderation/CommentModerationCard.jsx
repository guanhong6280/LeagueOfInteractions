import React, { useMemo } from 'react';
import * as MUI from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
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
    return null;
  }, [skin, champion, subjectType]);

  const subjectName = useMemo(() => {
    if (subjectType === 'champion') {
      return champion?.championId || 'Unknown Champion';
    }
    return skin?.name || 'Unknown Skin';
  }, [skin, champion, subjectType]);

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
            <MUI.Typography>{comment?.username || 'Unknown user'}</MUI.Typography>
            <MUI.Typography variant="date_text">
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

          <MUI.Typography variant="body2">
            {comment?.comment || 'No comment text available.'}
          </MUI.Typography>
        </MUI.Stack>

        {/* Subject (Skin or Champion) Information */}
        <MUI.Stack gap="10px">
          <MUI.Typography>
            {subjectName}
          </MUI.Typography>
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
                <MUI.Typography variant="body2">No preview</MUI.Typography>
              </MUI.Box>
            )}
          </MUI.Box>
        </MUI.Stack>

        {/* Action area */}
        <MUI.Stack gap="10px">
          <MUI.Button
            variant="contained"
            color="primary"
            startIcon={<CheckIcon />}
            onClick={onApprove}
            disabled={isProcessing}
          >
            Approve
          </MUI.Button>
          <MUI.Button
            variant="contained"
            color="error"
            startIcon={<CloseIcon />}
            onClick={onReject}
            disabled={isProcessing}
          >
            Reject
          </MUI.Button>
        </MUI.Stack>
      </MUI.Box>
    </MUI.Box>
  );
};

export default CommentModerationCard;
