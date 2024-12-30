import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Axios from 'axios';
import './Login.css';
import 'font-awesome/css/font-awesome.min.css';

function Login({ onLoginSuccess, onToggleRegister, onToggleForgotPassword }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [darkMode, setDarkMode] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username || !password) {
            setError('Por favor, completa todos los campos.');
            return;
        }

        try {
            const response = await Axios.post(
                'http://localhost:3001/login',
                { user_handle: username, password },
                { withCredentials: true }
            );

            if (response.status === 200) {
                if (onLoginSuccess) {
                    onLoginSuccess();
                }
                navigate('/profilePage'); // Redirigir al perfil
            }
        } catch (err) {
            setError(err.response?.data || 'Error al iniciar sesión');
        }
    };

    return (
        <div className={`login-container ${darkMode ? 'dark-mode' : ''}`}>
            <div className="login-card">
                <div className="logo-container">
                    <img
                        src={darkMode ? "/src/assets/Image/LURE-LOGO-WHITE.png" : "/src/assets/Image/LURE-LOGO.png"}
                        alt="Lure logo"
                    />
                </div>
                <h2>Bienvenido de nuevo</h2>
                <p className="subheading">Inicia sesión para continuar</p>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <label htmlFor="username">Usuario</label>
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
                        <label htmlFor="password">Contraseña</label>
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
                            >
                                {showPassword ? (
                                    <i className="fa fa-eye-slash" aria-hidden="true"></i>
                                ) : (
                                    <i className="fa fa-eye" aria-hidden="true"></i>
                                )}
                            </button>
                        </div>
                    </div>

                    {error && <p className="error-message">{error}</p>}

                    <button type="submit" className="login-button same-width">
                        Iniciar sesión
                    </button>
                </form>

                <div className="login-footer">
                    <a href="#" onClick={onToggleForgotPassword}>
                        ¿Olvidaste tu contraseña?
                    </a>
                    <p>
                        ¿No tienes una cuenta?{' '}
                        <a href="register" onClick={onToggleRegister}>
                            Regístrate
                        </a>
                    </p>
                    <p>
                        <a href="/">Volver al inicio</a>
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
