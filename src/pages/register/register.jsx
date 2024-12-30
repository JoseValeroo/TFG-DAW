import React, { useState } from 'react';
import Axios from 'axios';

import './Register.css';
import 'font-awesome/css/font-awesome.min.css';

function Register({ onRegisterSuccess, onToggleLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !password || !confirmPassword || !email || !firstName || !lastName || !phoneNumber) {
      setError('Por favor, completa todos los campos.');
      setTimeout(() => setError(''), 3000);
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      setTimeout(() => setError(''), 3000);
      return;
    }
    setError('');
    add(); // Llamar a la función de agregar usuario después de la validación
  };

  const add = () => {
    Axios.post("http://localhost:3001/create", {
      user_handle: username,
      email_address: email,
      first_name: firstName,
      last_name: lastName,
      phone_number: phoneNumber,
      password: password,
    })
      .then(() => {
        setSuccessMessage("Usuario creado correctamente");
        setTimeout(() => setSuccessMessage(''), 3000);
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        setEmail('');
        setFirstName('');
        setLastName('');
        setPhoneNumber('');
      })
      .catch((error) => {
        console.log(error);
        setError('Hubo un error al crear el usuario');
        setTimeout(() => setError(''), 3000);
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
          {/* Input fields */}
          {/* Aquí están las nuevas entradas con los estados correspondientes */}
          <label htmlFor="">Usuario</label>
          <input
            type="text"
            placeholder="Nombre de usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="register-input input-common"
            required
          />

          <label htmlFor="email">Correo Electrónico</label>
          <input
            type="email"
            placeholder="Correo Electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="register-input input-common"
            required
          />

          <label htmlFor="first_name">Nombre</label>
          <input
            type="text"
            placeholder="Nombre"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="register-input input-common"
            required
          />

          <label htmlFor="last_name">Apellido</label>
          <input
            type="text"
            placeholder="Apellido"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="register-input input-common"
            required
          />

          <label htmlFor="phone_number">Número de Teléfono</label>
          <input
            type="text"
            placeholder="Número de Teléfono"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="register-input input-common"
            required
          />

          {/* Contraseñas */}
          <label htmlFor="">Contraseña</label>
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
              {showPassword ? <i className="fa fa-eye-slash" /> : <i className="fa fa-eye" />}
            </button>
          </div>

          <label htmlFor="">Confirmar Contraseña</label>
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
              {showConfirmPassword ? <i className="fa fa-eye-slash" /> : <i className="fa fa-eye" />}
            </button>
          </div>

          {/* Mensajes de error y éxito */}
          {error && <p className="error-message">{error}</p>}
          {successMessage && <p className="success-message">{successMessage}</p>}
        </form>

        {/* Botones */}
        <div className="register-buttons">
          <button type="submit" className="register-button" onClick={handleSubmit}>
            Registrarse
          </button>
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
