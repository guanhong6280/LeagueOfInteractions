import React from 'react';
import * as MUI from '@mui/material';
import { getDonationProgress } from '../../api/donationApi';

const DonationCard = (props) => {
  const [progress, setProgress] = React.useState(0);
  const donationCardId = props.donationCardId;

  React.useEffect(() => {
    const fetchProgress = async () => {
      try {
        const data = await getDonationProgress(donationCardId);
        setProgress(data.totalDonations);
        console.log(data.totalDonations);
      } catch (error) {
        console.error('Error fetching progress:', error);
      }
    };

    fetchProgress();
  }, [donationCardId]);

  const progressPercentage = (progress / props.price) * 100; // Adjust if price is in dollars

  return (
    <MUI.Card
      sx={{
        maxWidth: 345,
        display: 'flex',
        flexDirection: 'column',
        border: '3px solid #000',
        borderRadius: '0px',
        boxShadow: '6px 6px 0px 0px #000',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translate(-2px, -2px)',
          boxShadow: '10px 10px 0px 0px #000',
        },
      }}
    >
      <MUI.CardMedia
        component="img"
        height="150"
        image={props.imageURL}
        alt={props.name}
        sx={{
          borderBottom: '3px solid #000',
        }}
      />
      <MUI.Stack marginY="10px" paddingX="16px" flex="1">
        <MUI.Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: '800' }}>
          {props.name}
        </MUI.Typography>
        <MUI.Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
          {props.description}
        </MUI.Typography>
      </MUI.Stack>
      <MUI.Stack spacing={2} paddingX="16px" paddingBottom="16px">
        <MUI.Box sx={{ position: 'relative', height: 20, border: '2px solid #000', width: '100%' }}>
          <MUI.Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              width: `${Math.min(progressPercentage, 100)}%`,
              backgroundColor: 'third.main',
              borderRight: progressPercentage < 100 ? '2px solid #000' : 'none',
            }}
          />
        </MUI.Box>
        <MUI.Typography variant="body2" color="textPrimary" fontWeight="bold">
          ${(progress).toFixed(2)} raised out of ${props.price}
        </MUI.Typography>
        <MUI.Button
          variant="contained"
          onClick={() => props.openDialog(props.donationCardId)}
          sx={{
            'border': '2px solid #000',
            'borderRadius': '0px',
            'boxShadow': '4px 4px 0px 0px #000',
            'fontWeight': 'bold',
            'textTransform': 'uppercase',
            'backgroundColor': 'primary.main',
            'color': 'black',
            'transition': 'all 0.1s ease-in-out',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
            '&:active': {
              boxShadow: '2px 2px 0px 0px #000',
              transform: 'translate(2px, 2px)',
            },
          }}
        >
          Donate
        </MUI.Button>
      </MUI.Stack>
    </MUI.Card>
  );
};

export default DonationCard;
