import React from 'react'
import * as MUI from "@mui/material";

const DonationCard = (props) => {
  return (
    <MUI.Card sx={{ maxWidth: 345 }}>
      <MUI.CardActionArea>
        <MUI.CardMedia
          component="img"
          height="140"
          image={props.imageURL}
          alt={props.name}
        />
        <MUI.CardContent>
          <MUI.Typography gutterBottom variant="h5" component="div">
            {props.name}
          </MUI.Typography>
          <MUI.Typography variant="body2" sx={{ color: 'text.secondary' }}>
           {props.description}
          </MUI.Typography>
        </MUI.CardContent>
      </MUI.CardActionArea>
    </MUI.Card>
  );
}

export default DonationCard