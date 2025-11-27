import React from 'react';
import * as MUI from '@mui/material';

const AmountCard = (props) => {
  return (
    <MUI.Chip
      label={`$${props.amount}`}
      clickable
      variant="filled"
      onClick={props.onClick}
      sx={{
        'backgroundImage': props.imageURL ? `url(${props.imageURL})` : 'none',
        'backgroundSize': 'cover',
        'backgroundPosition': 'center',
        'width': '90px',
        'height': '50px',
        'color': 'black',
        'backgroundColor': props.imageURL ? 'transparent' : 'white',
        'border': '2px solid #000',
        'borderRadius': '0px',
        'boxShadow': '4px 4px 0px 0px #000',
        'fontWeight': '800',
        'fontSize': '1.1rem',
        'transition': 'all 0.1s ease',
        '&:hover': {
          transform: 'translate(-2px, -2px)',
          boxShadow: '6px 6px 0px 0px #000',
          backgroundColor: props.imageURL ? 'transparent' : '#f0f0f0',
        },
        '&:active': {
          transform: 'translate(2px, 2px)',
          boxShadow: '2px 2px 0px 0px #000',
        },
      }}
    />
  );
};

export default AmountCard;
