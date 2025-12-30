import React from 'react';
import * as MUI from '@mui/material';
import DonationCard from '../common/donation/DonationCard';
import DonationDialog from '../common/donation/DonationDialog';
import { getDonationCards } from '../api/donationApi';

const Donate = () => {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [donationCardId, setDonationCardId] = React.useState(null);

  const [donationInformation, setDonationInformation] = React.useState([]);

  React.useEffect(() => {
    const fetchDonationCards = async () => {
      try {
        const data = await getDonationCards();
        setDonationInformation(data);
      } catch (error) {
        console.error('Error fetching donation cards:', error);
      }
    };

    fetchDonationCards();
  }, []);

  const openDialog = (donationCardId) => {
    setDialogOpen(true);
    setDonationCardId(donationCardId);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setDonationCardId(null);
  };

  return (
    <MUI.Stack spacing={4} paddingY="50px" alignItems="center">
      <MUI.Box
        sx={{
          backgroundColor: '#fff',
          border: '4px solid #000',
          boxShadow: '8px 8px 0px 0px #000',
          padding: '20px',
          width: 'fit-content',
        }}
      >
        <MUI.Typography variant="h3" fontWeight="900" textTransform="uppercase" color="black">
          Support Bob
        </MUI.Typography>
      </MUI.Box>
      <MUI.Box display="flex" justifyContent="center" gap="40px" flexWrap="wrap">
        {donationInformation.map((item) => {
          return (
            <DonationCard
              key={item._id}
              name={item.name}
              imageURL={item.imageURL}
              description={item.description}
              price={item.price}
              donationCardId={item._id} // Use the actual ObjectId
              openDialog={openDialog}
            />
          );
        })}
      </MUI.Box>
      <DonationDialog dialogOpen={dialogOpen} onClose={closeDialog} donationCardId={donationCardId}></DonationDialog>
    </MUI.Stack>
  );
};

export default Donate;
