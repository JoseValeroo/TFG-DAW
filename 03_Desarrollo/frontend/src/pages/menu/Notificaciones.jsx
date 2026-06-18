import { useState, useEffect } from 'react';
import { Heart, MessageCircle, UserPlus } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import { notificationsApi } from '../../services/api';
import { useAuth } from '../../context/auth-context';

const iconByType = {
  like: <Heart size={18} color="#f91880" />,
  reply: <MessageCircle size={18} color="#1d9bf0" />,
  follow: <UserPlus size={18} color="#00ba7c" />,
};

function Notificaciones() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationsApi
      .list(token)
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <AppShell title="Notificaciones">
      {loading && <p className="shell-empty">Cargando…</p>}
      {!loading && items.length === 0 && (
        <p className="shell-empty">No tienes notificaciones todavía.</p>
      )}
      {items.map((n, i) => (
        <div key={i} className="panel panel-row">
          <span className="gradient-avatar">{iconByType[n.type] ?? '🔔'}</span>
          <div>
            <strong>@{n.handle}</strong> <span className="muted">{n.text}</span>
          </div>
        </div>
      ))}
    </AppShell>
  );
}

export default Notificaciones;
