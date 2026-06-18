import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import { communitiesApi } from '../../services/api';
import { useAuth } from '../../context/auth-context';

function Comunidades() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    communitiesApi
      .list(token)
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const toggle = async (id) => {
    try {
      const { joined } = await communitiesApi.toggle(id, token);
      setItems((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, isMember: joined, members: c.members + (joined ? 1 : -1) }
            : c,
        ),
      );
    } catch {
      /* noop */
    }
  };

  return (
    <AppShell title="Comunidades">
      {loading && <p className="shell-empty">Cargando…</p>}
      {!loading && items.length === 0 && <p className="shell-empty">No hay comunidades.</p>}
      {items.map((c) => (
        <div key={c.id} className="panel">
          <div className="panel-row">
            <span className="gradient-avatar"><Users size={20} /></span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>{c.name}</div>
              <div className="muted">{c.members} miembros{c.category ? ` · ${c.category}` : ''}</div>
            </div>
            <button
              type="button"
              className={`pill-btn ${c.isMember ? 'ghost' : ''}`}
              onClick={() => toggle(c.id)}
            >
              {c.isMember ? 'Salir' : 'Unirse'}
            </button>
          </div>
          {c.description && <p className="muted" style={{ marginBottom: 0, marginTop: 10 }}>{c.description}</p>}
        </div>
      ))}
    </AppShell>
  );
}

export default Comunidades;
