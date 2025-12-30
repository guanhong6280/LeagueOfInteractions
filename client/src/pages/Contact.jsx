import React, { useState } from 'react';
import { Box, Typography, TextField, Button, CircularProgress } from '@mui/material';
import { sendContactMessage } from '../api/contactApi';
import { useToast } from '../toast/useToast';
import { toastMessages } from '../toast/useToast';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await sendContactMessage(formData);
      success(toastMessages.contact.success);
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Error sending message:', error);
      error(error.response?.data?.message || toastMessages.contact.error);
    } finally {
      setLoading(false);
    }
  };

  const inputStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '0px',
      backgroundColor: 'white',
      '& fieldset': {
        border: '3px solid black',
      },
      '&:hover fieldset': {
        border: '3px solid black',
        boxShadow: '4px 4px 0px rgba(0,0,0,0.2)',
      },
      '&.Mui-focused fieldset': {
        border: '3px solid black',
        boxShadow: '4px 4px 0px black',
      },
    },
    '& .MuiInputLabel-root': {
      color: 'black',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      '&.Mui-focused': {
        color: 'black',
      },
    },
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="80vh"
      padding="20px"
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: '100%',
          maxWidth: '600px',
          backgroundColor: '#FFDE00', // Neo-brutalist yellow
          border: '4px solid black',
          boxShadow: '8px 8px 0px black',
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: 900, 
            textTransform: 'uppercase', 
            textAlign: 'center',
            marginBottom: '10px',
            color: 'black'
          }}
        >
          Contact Me
        </Typography>

        <Typography variant="body1" sx={{ fontWeight: 'bold', textAlign: 'center', marginBottom: '10px' }}>
          Have a suggestion, found a bug, or just want to say hi? Shoot me an email!
        </Typography>

        <TextField
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          fullWidth
          variant="outlined"
          sx={inputStyles}
        />

        <TextField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          fullWidth
          variant="outlined"
          sx={inputStyles}
        />

        <TextField
          label="Message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          fullWidth
          multiline
          rows={6}
          variant="outlined"
          sx={inputStyles}
        />

        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{
            backgroundColor: 'black',
            color: 'white',
            fontWeight: 900,
            fontSize: '1.2rem',
            padding: '15px',
            borderRadius: '0px',
            textTransform: 'uppercase',
            border: '2px solid black',
            boxShadow: '4px 4px 0px rgba(0,0,0,0.5)',
            marginTop: '10px',
            '&:hover': {
              backgroundColor: 'white',
              color: 'black',
              boxShadow: '6px 6px 0px black',
              transform: 'translate(-2px, -2px)',
            },
            '&:active': {
              boxShadow: '2px 2px 0px black',
              transform: 'translate(2px, 2px)',
            },
            '&:disabled': {
              backgroundColor: '#555',
              color: '#ccc',
            }
          }}
        >
          {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Send Message'}
        </Button>
      </Box>
    </Box>
  );
};

export default Contact;
