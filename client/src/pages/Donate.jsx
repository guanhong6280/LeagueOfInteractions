import React from 'react';
import * as MUI from "@mui/material";
import axios from 'axios';
import DonationCard from '../common/donation/DonationCard';
import DonationDialog from '../common/donation/DonationDialog';

const donationInformation = [
  {
    id: 0,
    name: "Coursera",
    imageURL: "https://www.langoly.com/wp-content/uploads/2021/09/coursera-logo.png",
    description: "I want to become a better frontend developer by obtaining the frontend developer certificate from meta",
    price: 20
  },
  {
    id: 1,
    name: "Leetcode",
    imageURL: "https://assets.leetcode.com/static_assets/public/images/LeetCode_logo_rvs.png",
    description: "I use leetcode to strengthen my knowledge in data structures and algorithms.",
    price: 10
  },
  {
    id: 2,
    name: "FrontendMasters",
    imageURL: "https://static.frontendmasters.com/assets/fm/js/images/frontendmasters_3bcb5619.svg",
    description: "I use frontendmasters to hone my skill in frontend development",
    price: 39
  }
];


const Donate = () => {

  const [dialogOpen, setDialogOpen] = React.useState(false);

  const openDialog = () => {
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
  };

  // const handleDonate = async () => {
  //   try {
  //     // Send a POST request to your backend
  //     const response = await axios.post('http://localhost:5174/api/donations/create-checkout-session');

  //     // Redirect the user to the Stripe Checkout page
  //     window.location.href = response.data.url;
  //   } catch (error) {
  //     console.error('Error creating checkout session:', error);
  //   }
  // };

  return (
    <MUI.Stack>
      <MUI.Box marginTop="50px" display="flex" justifyContent="center" gap="20px">
        {donationInformation.map((item) => {
          return (
            <DonationCard
              key={item.id}
              name={item.name}
              imageURL={item.imageURL}
              description={item.description}
              price={item.price}
            />
          )
        })}
      </MUI.Box>
      <MUI.Button onClick={openDialog}>test</MUI.Button>
      <DonationDialog dialogOpen={dialogOpen} onClose={closeDialog}></DonationDialog>
    </MUI.Stack>
  );
};

export default Donate;