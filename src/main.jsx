import React from 'react';
import ReactDOM from 'react-dom/client';
import {NextUIProvider} from '@nextui-org/react'
import { BrowserRouter as Router } from 'react-router-dom';
import './main.css';
import AppRouter from './router/router';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
    <NextUIProvider>
      <AppRouter/>
    </NextUIProvider>
    </Router>
  </React.StrictMode>
);