import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import './login.css';
import lureLogo from '../../assets/Icons/Logo.svg';
import { useAuth } from '../../context/auth-context';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Por favor, completa todos los campos.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login({ username, password });
      navigate('/profilePage');
    } catch (err) {
      setError(err.message || 'No se pudo iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`login-container ${darkMode ? 'dark-mode' : ''}`}>
      <div className="login-card">
        <div className="logo-container">
          <img src={lureLogo} alt="Lure logo" />
        </div>

        <h2>Bienvenido de nuevo</h2>
        <p className="subheading">Inicia sesión para continuar</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="username" id="label-input">Usuario</label>
            <input
              id="username"
              type="text"
              placeholder="Nombre de usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="login-input same-width"
              required
              autoComplete="username"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password" id="password-input">Contraseña</label>
            <div className="password-container">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="password-input same-width"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
              </button>
            </div>
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="login-button same-width" disabled={loading}>
            {loading ? 'Iniciando…' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="login-footer">
          <Link to="/forgot">¿Olvidaste tu contraseña?</Link>
          <p>
            ¿No tienes una cuenta?{' '}
            <Link to="/register">Regístrate</Link>
          </p>
          <p>
            <Link to="/">Volver al inicio</Link>
          </p>
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

export default Login;
