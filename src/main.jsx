import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './redux/store.js' // ✅ default import
import App from './App.jsx';
import './index.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
  <BrowserRouter basename="/">
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <App />   
      </QueryClientProvider>
    </Provider>
  </BrowserRouter>
  </StrictMode>
);

 

