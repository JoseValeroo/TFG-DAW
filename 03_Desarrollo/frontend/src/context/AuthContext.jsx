import { useState } from 'react';
import { authApi } from '../services/api';
import { AuthContext } from './auth-context';

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

  // Actualiza campos del usuario en sesión (p. ej. avatarUrl) y persiste.
  const updateUser = (patch) => {
    setUser((prev) => {
      const next = { ...(prev ?? {}), ...patch };
      localStorage.setItem(USER_KEY, JSON.stringify(next));
      return next;
    });
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token),
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
