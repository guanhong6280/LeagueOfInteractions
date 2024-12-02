import React from 'react'
import * as MUI from "@mui/material";

const AmountCard = (props) => {
  return (
    <MUI.Chip 
    label={`$${props.amount}`} 
    clickable
    variant="outlined"
    onClick={props.onClick}
    sx={{
      backgroundImage: props.imageURL ? `url(${props.imageURL})`:'none',
      backgroundSize: "cover",
      backgroundPosition: "center",
      width: "75px",
      height: "40px",
      color: "primary.main", // Text color (for better contrast with the background)
      border: '2px solid', // Define the border thickness
      borderColor: 'primary.main', // Border color (can be a custom color or theme color)
      borderRadius: '5px', // Optional: Adjust the border radius
      transition: "transform 0.5s ease", // Slows down the transition to 0.5 seconds
      "&:hover":{
        transform: "scale(1.1)",
        borderColor: "third.main"
      }
    }}
    />
  )
}

export default AmountCard