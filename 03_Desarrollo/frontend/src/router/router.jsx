import { Routes, Route, Navigate } from 'react-router-dom';
import App from '../App';
import Login from '../pages/login/loginPage';
import RegisterPage from '../pages/register/register';
import ProfilePage from '../pages/profile/profilePage';
import ForgotPassword from '../pages/forgotpass/ForgotPassword';
import TarjetaMain from '../pages/TarjetaMain/TarjetaMain';
import { useAuth } from '../context/AuthContext';

// Envuelve rutas que requieren sesión iniciada.
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

const AppRouter = () => (
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
    {/* Cualquier ruta desconocida vuelve al inicio */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRouter;
