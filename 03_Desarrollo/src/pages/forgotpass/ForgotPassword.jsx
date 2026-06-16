import React, { useState } from 'react';
import './ForgotPassword.css'; 

function ForgotPassword({ onToggleLogin }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setError('Por favor, ingresa tu correo electrónico.');
      return;
    }

    setMessage('Te hemos enviado un enlace para restablecer tu contraseña a ' + email);
    setError('');
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h2>Olvidé mi contraseña</h2>
        <form onSubmit={handleSubmit} className="forgot-password-form">
          <label htmlFor="">Correo electrónico</label>
          <input
            type="email"
            placeholder="Ingresa tu correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="forgot-password-input"
            required
          />
          {error && <p className="error-message">{error}</p>}
          {message && <p className="success-message">{message}</p>}
          <button type="submit" className="forgot-password-button">Enviar enlace</button>
        </form>
        <div className="forgot-password-footer">
          <p>¿Ya tienes tu contraseña? <a href="#" onClick={onToggleLogin}>Iniciar sesión</a></p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
