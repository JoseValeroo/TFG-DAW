import { createContext, useContext, useState } from 'react';

/**
 * Contexto de autenticación.
 *
 * NOTA: la verificación de credenciales es todavía un MOCK en cliente
 * (ver pages/login). Cuando exista el backend (rama feat/bbdd-back) la función
 * `login` deberá llamar a la API y guardar el token JWT en lugar del usuario plano.
 */
const AuthContext = createContext(null);

const STORAGE_KEY = 'lure_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = {
    user,
    isAuthenticated: Boolean(user),
    login,
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
