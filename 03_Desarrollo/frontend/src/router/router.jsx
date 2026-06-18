import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/auth-context';

// Code-splitting por ruta: cada página es un chunk independiente que se
// descarga solo cuando se visita. Así Ant Design (que solo usa el perfil) no
// entra en el bundle inicial de la home/login.
const App = lazy(() => import('../App'));
const Login = lazy(() => import('../pages/login/loginPage'));
const RegisterPage = lazy(() => import('../pages/register/register'));
const ProfilePage = lazy(() => import('../pages/profile/profilePage'));
const ForgotPassword = lazy(() => import('../pages/forgotpass/ForgotPassword'));
const TarjetaMain = lazy(() => import('../pages/TarjetaMain/TarjetaMain'));
const Configuracion = lazy(() => import('../pages/menu/Configuracion'));
const Cuentas = lazy(() => import('../pages/menu/Cuentas'));
const Notificaciones = lazy(() => import('../pages/menu/Notificaciones'));
const Comunidades = lazy(() => import('../pages/menu/Comunidades'));
const Mensajes = lazy(() => import('../pages/menu/Mensajes'));

// Envuelve rutas que requieren sesión iniciada.
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

const AppRouter = () => (
  <Suspense
    fallback={
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        Cargando…
      </div>
    }
  >
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/feed" element={<TarjetaMain />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot" element={<ForgotPassword />} />
      <Route
        path="/profilePage"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route path="/configuracion" element={<ProtectedRoute><Configuracion /></ProtectedRoute>} />
      <Route path="/cuentas" element={<ProtectedRoute><Cuentas /></ProtectedRoute>} />
      <Route path="/notificaciones" element={<ProtectedRoute><Notificaciones /></ProtectedRoute>} />
      <Route path="/comunidades" element={<ProtectedRoute><Comunidades /></ProtectedRoute>} />
      <Route path="/mensajes" element={<ProtectedRoute><Mensajes /></ProtectedRoute>} />
      {/* Cualquier ruta desconocida vuelve al inicio */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Suspense>
);

export default AppRouter;
