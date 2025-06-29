import React from 'react';
// import logo from './logo.svg';
import './App.css';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './Components/NavBar';
import Routing from './Routes/Routing';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <div className="App">
      <QueryClientProvider client={queryClient}>  
        <BrowserRouter>
          <Navbar />
          <Routing />
        </BrowserRouter>
      </QueryClientProvider>
    </div>
  );
}

export default App;