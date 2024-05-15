import React from 'react';
import './App.css';
import CacheMetrics from './CacheMetrics';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import BasicCard from './Card';
import { Grid } from '@mui/material';
import Dashboard from './Dashboard';

function App() {
  return (
    <div className="App">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Aurora Performance Visualizer
          </Typography>
        </Toolbar>
      </AppBar>
      <Grid container spacing={2}>
        <Grid xs={8}>
          <Box className="Box">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              {/* <CacheMetrics /> */}
              <Dashboard />
            </LocalizationProvider>
          </Box>
        </Grid>
        {/* <Grid xs={4}>
          <Box className="Box">
            <BasicCard />
          </Box>
        </Grid> */}
      </Grid>
    </div>
  );
}

export default App;
