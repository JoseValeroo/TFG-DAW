import React from 'react';
import { Routes, Route } from 'react-router-dom';
import App from '../App';
//Páginas Componentes Padre
import Login from '../pages/login/loginPage'; // Archivo en minúscula, componente con mayúscula
import RegisterPage from '../pages/register/register';
import ProfilePage from '../pages/profile/profilePage';
import CardPadre from '../components/CardPadre/CardPadre';

const AppRouter = ({ handleLoginSuccess }) => (
  <Routes>
    <Route path="/" element={<App />} />
    <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
    <Route path="/register" element={<RegisterPage onRegisterSuccess={() => {}} />} />
    <Route path="/profilePage" element={<ProfilePage />} />
    <Route path="/cardPadre" element={<CardPadre />} />
  </Routes>
);

export default AppRouter;
