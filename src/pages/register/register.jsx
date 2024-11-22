import React, { useState } from 'react';
import './Register.css';
import 'font-awesome/css/font-awesome.min.css';

function Register({ onRegisterSuccess, onToggleLogin }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(false); // Estado para alternar entre claro y oscuro

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !email || !password || !confirmPassword) {
      setError('Por favor, completa todos los campos.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    console.log('Registro exitoso:', { username, email, password });
    setError('');
    onRegisterSuccess();
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

          <label htmlFor="" id='label-input'>Email</label>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
              {showPassword ? <i className="fa fa-eye-slash" aria-hidden="true"></i> : <i className="fa fa-eye" aria-hidden="true"></i>}
            </button>
          </div>

          {error && <p className="error-message">{error}</p>}
        </form>

        <div className="register-buttons">
          <button type="submit" className="register-button">Registrarse</button>
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
