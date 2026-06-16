import { createContext, useContext } from 'react';

// Contexto y hook de autenticación. Se separan del provider (AuthContext.jsx)
// para que cada archivo exporte un único tipo de cosa (compatibilidad con
// React Fast Refresh: un fichero = solo componentes, o solo helpers).
export const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return context;
}
