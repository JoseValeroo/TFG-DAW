import { useState } from 'react';
import { Link } from 'react-router-dom';
import './ForgotPassword.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setError('Por favor, ingresa tu correo electrónico.');
      return;
    }
    setError('');
    // MOCK: el envío real del email se implementará con el backend.
    setMessage('Te hemos enviado un enlace para restablecer tu contraseña a ' + email);
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h2>Olvidé mi contraseña</h2>
        <form onSubmit={handleSubmit} className="forgot-password-form">
          <label htmlFor="forgot-email">Correo electrónico</label>
          <input
            id="forgot-email"
            type="email"
            placeholder="Ingresa tu correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="forgot-password-input"
            required
            autoComplete="email"
          />
          {error && <p className="error-message">{error}</p>}
          {message && <p className="success-message">{message}</p>}
          <button type="submit" className="forgot-password-button">Enviar enlace</button>
        </form>
        <div className="forgot-password-footer">
          <p>¿Ya tienes tu contraseña? <Link to="/login">Iniciar sesión</Link></p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
