import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './register.css';
import 'font-awesome/css/font-awesome.min.css';
import lureLogo from '../../assets/Icons/Logo.svg';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  const navigate = useNavigate();

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
    setError('');
    // MOCK: aquí irá la llamada al backend (POST /register) en feat/bbdd-back.
    navigate('/login');
  };

  return (
    <div className={`register-container ${darkMode ? 'dark-mode' : ''}`}>
      <div className="register-card">
        <div className="register-logo">
          <img src={lureLogo} alt="Lure logo" />
        </div>
        <h2>Crea tu cuenta</h2>
        <p className="subheading">Crea una cuenta para continuar</p>
        <form onSubmit={handleSubmit} className="register-form">
          <label htmlFor="reg-username" id="label-input">Usuario</label>
          <input
            id="reg-username"
            type="text"
            placeholder="Nombre de usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="register-input input-common"
            required
            autoComplete="username"
          />

          <label htmlFor="reg-email">Email</label>
          <input
            id="reg-email"
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="register-input input-common"
            required
            autoComplete="email"
          />

          <label htmlFor="reg-password">Contraseña</label>
          <div className="password-container">
            <input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="register-input input-common"
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <i className="fa fa-eye-slash" aria-hidden="true"></i> : <i className="fa fa-eye" aria-hidden="true"></i>}
            </button>
          </div>

          <label htmlFor="reg-confirm">Confirmar Contraseña</label>
          <div className="password-container">
            <input
              id="reg-confirm"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="register-input input-common"
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showConfirmPassword ? <i className="fa fa-eye-slash" aria-hidden="true"></i> : <i className="fa fa-eye" aria-hidden="true"></i>}
            </button>
          </div>

          {error && <p className="error-message">{error}</p>}

          <div className="register-buttons">
            <button type="submit" className="register-button">Registrarse</button>
          </div>
        </form>

        <div className="register-footer">
          <p>¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link></p>
          <p><Link to="/">Volver al Inicio</Link></p>
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

export default RegisterPage;
