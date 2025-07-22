import React from 'react';
import * as MUI from '@mui/material';
import axios from 'axios';

const DonationCard = (props) => {
  const [progress, setProgress] = React.useState(0);
  const donationCardId = props.donationCardId;

  React.useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await axios.get(`http://localhost:5174/api/donations/progress/${donationCardId}`, { withCredentials: true });
        setProgress(response.data.totalDonations);
        console.log(response.data.totalDonations);
      } catch (error) {
        console.error('Error fetching progress:', error);
      }
    };

    fetchProgress();
  }, [donationCardId]);

  const progressPercentage = (progress / props.price) * 100; // Adjust if price is in dollars

  return (
    <MUI.Card sx={{ maxWidth: 345, display: 'flex', flexDirection: 'column' }}>
      <MUI.CardMedia
        component="img"
        height="150"
        image={props.imageURL}
        alt={props.name}
      />
      <MUI.Stack marginY="10px" paddingX="16px" flex="1">
        <MUI.Typography gutterBottom variant="h5" component="div">
          {props.name}
        </MUI.Typography>
        <MUI.Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {props.description}
        </MUI.Typography>
      </MUI.Stack>
      <MUI.Stack spacing={2} paddingX="16px" paddingBottom="16px">
        <MUI.LinearProgress
          variant="determinate"
          color="third"
          value={progressPercentage}
          sx={{ height: 10, borderRadius: 5, width: '100%' }}
        />
        <MUI.Typography variant="body2" color="textSecondary">
          ${(progress).toFixed(2)} raised out of ${props.price}
        </MUI.Typography>
        <MUI.Button
          variant="contained"
          onClick={() => props.openDialog(props.donationCardId)}
        >
          Donate
        </MUI.Button>
      </MUI.Stack>
    </MUI.Card>
  );
};

export default DonationCard;
