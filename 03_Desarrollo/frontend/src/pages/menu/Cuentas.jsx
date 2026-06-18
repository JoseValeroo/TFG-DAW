import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import { profileApi } from '../../services/api';
import { useAuth } from '../../context/auth-context';

function Cuentas() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    profileApi.me(token).then(setProfile).catch(() => {});
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <AppShell title="Cuentas">
      <div className="panel">
        <div className="panel-row">
          <span className="gradient-avatar">{(profile?.name || '?').charAt(0).toUpperCase()}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17 }}>{profile?.name ?? '—'}</div>
            <div className="muted">@{profile?.username ?? '—'}</div>
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <p><span className="muted">Correo:</span> {profile?.email ?? '—'}</p>
          <p><span className="muted">Seguidores:</span> {profile?.followers ?? 0} · <span className="muted">Seguidos:</span> {profile?.following ?? 0}</p>
          <p><span className="muted">Publicaciones:</span> {profile?.tweetsCount ?? 0}</p>
        </div>
      </div>

      <div className="panel">
        <h3 style={{ marginTop: 0 }}>Sesión</h3>
        <p className="muted">Has iniciado sesión como @{profile?.username ?? '—'}.</p>
        <button type="button" className="pill-btn ghost" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </AppShell>
  );
}

export default Cuentas;
