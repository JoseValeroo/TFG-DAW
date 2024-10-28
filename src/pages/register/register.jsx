import React, { useState } from 'react';
import './Register.css';
import EyeOpen from '../../assets/Icons/EyeClosed.svg';
import EyeClosed from '../../assets/Icons/EyeOpen.svg';

function Register({ onRegisterSuccess, onToggleLogin }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

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
    <div className="register-container">
      <div className="register-card">
        <div className="register-logo">X</div>
        <h2>Crea tu cuenta</h2>
        <form onSubmit={handleSubmit} className="register-form">

          <label htmlFor="">Usuario</label>
          <input type="text"placeholder="Nombre de usuario" value={username} onChange={(e) => setUsername(e.target.value)} className="register-input input-common" required/>
          
          <label htmlFor="">Email</label>
          <input type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} className="register-input input-common" required/>
          
          <label htmlFor="">Contraseña</label>
          <div className="password-container">
            <input type={showPassword ? 'text' : 'password'} placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} className="register-input input-common" required/>
            <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
              <img src={showPassword ? EyeOpen : EyeClosed} alt="Toggle Password Visibility" />
            </button>
          </div>
          <label htmlFor="">Confirmar Contraseña</label>

          <div className="password-container">
            <input type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirmar contraseña" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="register-input input-common" required/>
            <button type="button" className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              <img src={showConfirmPassword ? EyeOpen : EyeClosed} alt="Toggle Confirm Password Visibility" />
            </button>
          </div>

          {error && <p className="error-message">{error}</p>}
        
        </form>
  
        <div className="register-buttons">
          <button type="submit" className="register-button">Registrarse</button>
        </div>
        <div className="register-footer">
          <p>¿Ya tienes una cuenta? <a href="" onClick={onToggleLogin}>Inicia sesión</a></p>
          <p><a href="/">Inicio</a></p>
        </div>
      </div>
    </div>
  );
}

export default Register;
