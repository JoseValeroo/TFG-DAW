import React, { useState } from 'react';
import Axios from 'axios';

import './Register.css';
import 'font-awesome/css/font-awesome.min.css';

function Register({ onRegisterSuccess, onToggleLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !password || !confirmPassword) {
      setError('Por favor, completa todos los campos.');
      setTimeout(() => setError(''), 3000);  // Elimina el mensaje de error después de 3 segundos
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      setTimeout(() => setError(''), 3000);  // Elimina el mensaje de error después de 3 segundos
      return;
    }
    setError('');
    onRegisterSuccess();
    add();  // Llamar a la función de agregar usuario después de la validación
  };

  const add = () => {
    Axios.post("http://localhost:3001/create", {
      username: username,
      password: password
    }).then(() => {
      setSuccessMessage("Usuario creado correctamente");
      setTimeout(() => setSuccessMessage(''), 3000);  // Elimina el mensaje de éxito después de 3 segundos
      // Vaciar los campos después de un registro exitoso
      setUsername('');
      setPassword('');
      setConfirmPassword('');
    }).catch(() => {
      setError('Hubo un error al crear el usuario');
      setTimeout(() => setError(''), 3000);  // Elimina el mensaje de error después de 3 segundos
    });
  };

  return (
    <div className={`register-container ${darkMode ? 'dark-mode' : ''}`}>
      <div className="register-card">
        <div className="register-logo">
          <img
            src={darkMode ? "/src/assets/Image/LURE-LOGO-WHITE.png" : "/src/assets/Image/LURE-LOGO.png"} 
            alt="Lure logo" 
          />
        </div>
        <h2>Crea tu cuenta</h2>
        <p className="subheading">Crea una cuenta para continuar</p>
        <form onSubmit={handleSubmit} className="register-form">
          <label htmlFor="" id='label-input'>Usuario</label>
          <input
            type="text"
            placeholder="Nombre de usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="register-input input-common"
            required
          />

          <label htmlFor="" id='label-input'>Contraseña</label>
          <div className="password-container">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="register-input input-common"
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <i className="fa fa-eye-slash" aria-hidden="true"></i> : <i className="fa fa-eye" aria-hidden="true"></i>}
            </button>
          </div>

          <label htmlFor="" id='label-input'>Confirmar Contraseña</label>
          <div className="password-container">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="register-input input-common"
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <i className="fa fa-eye-slash" aria-hidden="true"></i> : <i className="fa fa-eye" aria-hidden="true"></i>}
            </button>
          </div>

          {error && <p className="error-message">{error}</p>}
        </form>

        <div className="register-buttons">
          <button type="submit" className="register-button" onClick={handleSubmit}>Registrarse</button>
        </div>
        <div>
          {successMessage && <p className="success-message">{successMessage}</p>} 
        </div>
        <div className="register-footer">
          <p>¿Ya tienes una cuenta? <a href="login" onClick={onToggleLogin}>Inicia sesión</a></p>
          <p><a href="/">Volver al Inicio</a></p>
        </div>
        
        <button
          type="button"
          onClick={() => setDarkMode(!darkMode)}
          className="dark-mode-button"
        >
          {darkMode ? 'Modo Claro' : 'Modo Oscuro'}
        </button>
      </div>
    </div>
  );
}

export default Register;
