import * as MUI from "@mui/material";
import { ThemeProvider } from '@mui/material/styles';
import { Outlet, Link } from 'react-router-dom';

import './App.css'
import theme from "./theme";

function App() {

  return (
    <>
      <ThemeProvider theme={theme}>
        <MUI.Stack
          sx={{
            backgroundImage: "url(https://creatorverse-production.up.railway.app/static/media/banner.de5659898d3bfc5eb8ea.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderBottom: '5px solid rgb(66, 74, 89)'
          }}
        >
          <MUI.Stack alignItems="center" spacing="3rem" marginY="150px">
            <MUI.Typography marginTop="150px" variant="h1" color="primary">CREATORVERSE</MUI.Typography>
            <MUI.Box width="720px" height="80px" display="flex" alignItems="center" justifyContent="center" gap="50px">
              <MUI.Button
                color="secondary"
                variant="contained"
                component={Link}
                to="/"
                sx={{
                  width: "300px",
                  height: "60px",
                  fontSize: "20px",
                  fontWeight: "700"
                }}>
                View All Creators
              </MUI.Button>
              <MUI.Button
                color="secondary"
                variant="contained"
                component={Link}
                to="/add"
                sx={{
                  width: "300px",
                  height: "60px",
                  fontSize: "20px",
                  fontWeight: "700"
                }}
              >
                Add a Creator
              </MUI.Button>
            </MUI.Box>
          </MUI.Stack>
        </MUI.Stack>
        <Outlet />
      </ThemeProvider>
    </>
  );
}

export default App
