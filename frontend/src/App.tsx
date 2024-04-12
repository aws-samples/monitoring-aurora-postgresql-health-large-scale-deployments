import React from 'react';
import './App.css';
import CacheMetrics from './CacheMetrics';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <CacheMetrics />
        </LocalizationProvider>

      </header>
    </div>
  );
}

export default App;
