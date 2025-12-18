import { Box } from '@mui/material';
import * as MUI from '@mui/material';
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';
import VideoLibraryOutlinedIcon from '@mui/icons-material/VideoLibraryOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { NavLink } from 'react-router-dom';
import Logo from '../../common/Logo';
import useCurrentUser from '../../hooks/useCurrentUser';
import useLogout from '../../hooks/useLogout';


export default function AdminNav() {
  const { user } = useCurrentUser();
  const { mutateAsync: logout } = useLogout();
  const email = user?.email || 'admin@example.com';

  const moderationLinks = [
    {
      label: 'Comment Approval',
      to: '/admin/comments',
      icon: CommentOutlinedIcon,
      helper: 'Review user comments before publishing.',
    },
    {
      label: 'Video Approval',
      to: '/admin/videos',
      icon: VideoLibraryOutlinedIcon,
      helper: 'Moderate submitted clips and highlights.',
    },
    {
      label: 'Reports Queue',
      to: '/admin/reports',
      icon: GavelOutlinedIcon,
      helper: 'Triage community reports and escalations.',
    },
    {
      label: 'Settings',
      to: '/admin/settings',
      icon: SettingsIcon,
      helper: 'Configure admin settings.',
    },
    {
      label: 'Logout',
      to: null,
      icon: LogoutIcon,
      helper: 'Logout of the admin panel.',
    },
  ];

  return (
    <Box
      component="nav"
      width="20vw"
      bgcolor="surface.nav"
      borderRight="1px solid surface.hairlineDark"
      paddingX="26px"
      paddingY="52px"
      display="flex"
      flexDirection="column"
      gap={3}
    >
      {/* profile / nav list / bottom utils go here */}
      <MUI.Stack >
        <MUI.Avatar src={user?.profilePictureURL ?? undefined} variant="square">
          {!user?.profilePictureURL && (user?.username?.[0] || 'A')}
        </MUI.Avatar>
        <MUI.Typography variant="admin_name">
          {user?.username}
        </MUI.Typography>
        <MUI.Typography variant="admin_email">
          {email}
        </MUI.Typography>
      </MUI.Stack>
      <MUI.Stack
        spacing={1.5}
        marginTop="64px"
      >
        {moderationLinks.map(({ label, to, icon: Icon, helper }) => (
          <Box key={label}>
            <MUI.Button
              component={to ? NavLink : 'button'}
              to={to || undefined}
              variant="text"
              startIcon={<Icon />}
              onClick={label === 'Logout' ? () => logout() : undefined}
              sx={{
                justifyContent: 'flex-start',
                // textColor: 'navigation_text',
                color: '#878787',
                px: 1.5,
                borderRadius: 2,
                gap: 1.5,
                textTransform: 'none',
                fontWeight: 500,
                '& .MuiButton-startIcon': { color: 'text.secondary', mr: 1.5 },
                '&.active': {
                  color: 'white',
                  '& .MuiButton-startIcon': { color: 'white' },
                },
              }}
            >
              {label}
            </MUI.Button>
          </Box>
        ))}
      </MUI.Stack>

      <MUI.Box
        marginTop="auto"
        display="flex"
        padding="6px"
        width="fit-content"
        bgcolor="background.default"
        borderRadius="10px"
      >
        <Logo marginLeft={false} />
      </MUI.Box>
    </Box>
  );
}
