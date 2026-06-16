import React from 'react';
import ReactDOM from 'react-dom/client';
import { NextUIProvider } from '@nextui-org/react';
import { BrowserRouter as Router } from 'react-router-dom';
import './main.css';
import AppRouter from './router/router';
import { AuthProvider } from './context/AuthContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <NextUIProvider>
          <AppRouter />
        </NextUIProvider>
      </AuthProvider>
    </Router>
  </React.StrictMode>
);
