import React, { useState } from 'react'
import './Login.css'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!username || !password) {
      setError('Por favor, completa todos los campos.')
      return
    }
    // Aquí iría la lógica de autenticación
    console.log('Iniciando sesión con:', { username, password })
    setError('')
  }

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Bienvenido de nuevo</h2>
        <p>Inicia sesión en tu cuenta</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Nombre de usuario</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Tu nombre de usuario"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="password-input">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tu contraseña"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="submit-button">
            Iniciar sesión
          </button>
        </form>
      </div>
    </div>
  )
}
export default Login