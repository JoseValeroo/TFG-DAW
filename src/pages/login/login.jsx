import React, { useState } from 'react';
import './Login.css';

function Login({ onLoginSuccess, onToggleRegister, onToggleForgotPassword }) {
  //setUsername...etc son hooks de useStates
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
//Define una función llamada handleSubmit que maneja el envío del formulario.
//(e): Recibe el evento del formulario
  const handleSubmit = (e) => {
    //Elimina el comportamiento del formulario (recargar la pagina)
    e.preventDefault();
    if (!username || !password) {
      setError('Por favor, completa todos los campos.');
      return;
    }
    //Usuario admin por ahora, cuando conectemos con bbdd cambiamos
    if (username === 'admin' && password === 'admin') {
      onLoginSuccess();
    } else {
      setError('Credenciales incorrectas.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">LURE</div>

        <h2>Iniciar sesión en LURE</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <label htmlFor="username">Usuario</label>
          <input
            id="username"
            type="text"
            placeholder="Nombre de usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="login-input input-common"
            required
            autoComplete="username"
            />

          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="password-input"
            required
            autoComplete="current-password"
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}> 
          </button>

          {error && <p className="error-message">{error}</p>}

          <div className="login-buttons">
            <button type="submit" className="login-button">Iniciar sesión</button>
          </div>
        </form>

        <div className="login-footer">
          <a href="register" onClick={onToggleForgotPassword}>¿Olvidaste tu contraseña?</a>
          <p>¿No tienes una cuenta? <a href="#" onClick={onToggleRegister}>Regístrate</a></p>
          <p><a href="/">Inicio</a></p>
        </div>
      </div>
    </div>
  );
}

export default Login;
