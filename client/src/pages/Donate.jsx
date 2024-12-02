import React from 'react';
import * as MUI from "@mui/material";
import DonationCard from '../common/donation/DonationCard';
import DonationDialog from '../common/donation/DonationDialog';
import axios from 'axios';

const Donate = () => {

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [donationCardId, setDonationCardId] = React.useState(null);

  const [donationInformation, setDonationInformation] = React.useState([]);

  React.useEffect(() => {
    const fetchDonationCards = async () => {
      try {
        const response = await axios.get('http://localhost:5174/api/donations/donation-cards');
        setDonationInformation(response.data);
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
    <MUI.Stack>
      <MUI.Box marginTop="50px" display="flex" justifyContent="center" gap="20px">
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
          )
        })}
      </MUI.Box>
      <MUI.Button variant="outlined" onClick={openDialog}>test</MUI.Button>
      <DonationDialog dialogOpen={dialogOpen} onClose={closeDialog} donationCardId={donationCardId}></DonationDialog>
    </MUI.Stack>
  );
};

export default Donate;