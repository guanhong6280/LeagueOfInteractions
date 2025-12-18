import * as MUI from '@mui/material';

const ActivityCardLayout = () => {
  return (
    <MUI.Box
      component="fieldset"
      display="flex"
      flexDirection="column"
    >
      <MUI.Typography component="legend" variant="h6">
        Comment/Rating
      </MUI.Typography>
      <MUI.Box 
      display="flex"
      >
        <MUI.Stack>
          <MUI.Box display="flex" alignItems="center" justifyContent="center">
            <MUI.Typography>Champion or Skin Name</MUI.Typography>
            <MUI.Typography>date created</MUI.Typography>
          </MUI.Box>
          <MUI.Box display="flex" alignItems="center" justifyContent="center">
            this place renders the comment or rating
          </MUI.Box>
        </MUI.Stack>
        <MUI.Box>
          this box renders champion or skin image
        </MUI.Box>
      </MUI.Box>

    </MUI.Box>
  );
};

export default ActivityCardLayout;