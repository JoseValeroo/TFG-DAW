import { createContext, useContext, useState } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'lure_token';
const USER_KEY = 'lure_user';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const persist = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
  };

  // Inicia sesión contra el backend. Lanza Error con el mensaje del servidor si falla.
  const login = async (credentials) => {
    const { token: newToken, user: newUser } = await authApi.login(credentials);
    persist(newToken, newUser);
  };

  // Registra y deja la sesión iniciada (el backend devuelve token al registrar).
  const register = async (payload) => {
    const { token: newToken, user: newUser } = await authApi.register(payload);
    persist(newToken, newUser);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token),
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return context;
}
