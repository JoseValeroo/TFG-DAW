import React from 'react';
import { Routes, Route } from 'react-router-dom';
import App from '../App'; // Tu componente principal
import Login from '../pages/login/login';
import Register from '../pages/register/register';
import ForgotPassword from '../pages/forgotpass/ForgotPassword';
import TarjetaMain from '../pages/TarjetaMain/TarjetaMain';
import ProfilePage from '../pages/profile/profile';


const AppRouter = ({ handleLoginSuccess }) => (
  <Routes>
    <Route path="/" element={<App />} /> // Ruta para la página principal
    <Route path="/TarjetaMain" element={<TarjetaMain />} /> // Ruta para la tarjeta principal
    <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} /> // Ruta para la página de login
    <Route path="/register" element={<Register onRegisterSuccess={() => {}} />} /> // Ruta para la página de registro
    <Route path="/forgot-password" element={<ForgotPassword />} /> // Ruta para la página de recuperación de contraseña 
    <Route path="/profile" element={<ProfilePage />} />
  </Routes>
);

export default AppRouter;
