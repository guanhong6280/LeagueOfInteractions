import React from 'react'
import * as MUI from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import AmountCard from './AmountCard';
import axios from 'axios';

const DonationAmounts = [
  {
    id: 0,
    dollarValue: "0.50",
    value: 50,
    imageURL: null
  },
  {
    id: 1,
    dollarValue: "1.00",
    value: 100,
    imageURL: null
  },
  {
    id: 2,
    dollarValue: "2.00",
    value: 200,
    imageURL: null
  },
  {
    id: 3,
    dollarValue: "4.00",
    value: 400,
    imageURL: "https://ddragon.leagueoflegends.com/cdn/14.22.1/img/passive/Jhin_P.png"
  },
  {
    id: 4,
    dollarValue: "10.00",
    value: 1000,
    imageURL: null
  },
  {
    id: 5,
    dollarValue: "20.00",
    value: 2000,
    imageURL: null
  },
  {
    id: 6,
    dollarValue: "50.00",
    value: 5000,
    imageURL: null
  },
  {
    id: 7,
    dollarValue: "100.00",
    value: 10000,
    imageURL: null
  },
];

const DonationDialog = (props) => {

  const donationCardId = props.donationCardId;
  
  const handleDonate = async (amount) => {
    try {
      // Send a POST request to your backend
      const response = await axios.post('http://localhost:5174/api/donations/create-checkout-session', {
        amount,
        donationCardId,
      });

      // Redirect the user to the Stripe Checkout page
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
  };

  return (
    <MUI.Dialog
      open={props.dialogOpen}
      onClose={props.onClose}
      sx={{
        '& .MuiPaper-root': {
          backgroundColor: "black",
          opacity: 1
        },
      }}
    >
      <CloseIcon
        onClick={props.onClose}
        sx={{
          color: "white",
          position: "absolute",
          right: 15,
          top: 13,
          cursor: "pointer",
          "&:hover": {
            color: "red", // Change color on hover
          },
        }}
      />
      <MUI.DialogTitle>
        <MUI.Typography display="flex" alignItems="center" justifyContent="center" color="primary">Select Amount</MUI.Typography>
      </MUI.DialogTitle>
      <MUI.DialogActions>
        <MUI.Grid2 container spacing={2} marginX="50px">
          {DonationAmounts.map((amount) => (
            <MUI.Grid2 size={4} key={amount.id} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AmountCard amount={amount.dollarValue} imageURL={amount.imageURL} onClick={() => handleDonate(amount.value)} />
            </MUI.Grid2>
          ))}
        </MUI.Grid2>
      </MUI.DialogActions>
      <MUI.Typography
        display="flex"
        alignItems="center"
        justifyContent="center"
        color="primary"
        fontSize="12px"
        marginY="15px"
      >
        Thank you for your donation!
      </MUI.Typography>
    </MUI.Dialog>
  )
}

export default DonationDialog