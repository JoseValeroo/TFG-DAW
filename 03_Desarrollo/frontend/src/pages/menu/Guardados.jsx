import { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import { feedApi } from '../../services/api';
import { useAuth } from '../../context/auth-context';
import './Guardados.css';

function Media({ type, url }) {
  if (!type || !url) return null;
  if (type === 'image') return <img className="sv-media" src={url} alt="adjunto" loading="lazy" />;
  if (type === 'video') return <video className="sv-media" src={url} controls preload="metadata" />;
  if (type === 'pdf') return <a className="sv-pdf" href={url} target="_blank" rel="noreferrer">📄 Ver documento PDF</a>;
  return null;
}

function Guardados() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    feedApi.getSaved(token).then(setItems).catch(() => {}).finally(() => setLoading(false));
  }, [token]);

  const unsave = async (id) => {
    try {
      await feedApi.toggleSave(id, token);
      setItems((prev) => prev.filter((t) => t.id !== id));
    } catch {
      /* noop */
    }
  };

  return (
    <AppShell title="Guardados">
      {loading && <p className="shell-empty">Cargando…</p>}
      {!loading && items.length === 0 && <p className="shell-empty">No tienes tweets guardados.</p>}
      {items.map((t) => (
        <div key={t.id} className="panel">
          <div className="panel-row">
            <span className="gradient-avatar">{(t.author?.name || '?').charAt(0).toUpperCase()}</span>
            <div style={{ flex: 1 }}>
              <strong>{t.author?.name}</strong> <span className="muted">@{t.author?.handle}</span>
            </div>
            <button type="button" className="pill-btn" onClick={() => unsave(t.id)} title="Quitar de guardados">
              <Bookmark size={16} fill="currentColor" />
            </button>
          </div>
          <p style={{ margin: '10px 0' }}>{t.text}</p>
          <Media type={t.mediaType} url={t.mediaUrl} />
          <div className="muted" style={{ fontSize: 13 }}>♥ {t.likes} · ↻ {t.retweets} · 💬 {t.comments}</div>
        </div>
      ))}
    </AppShell>
  );
}

export default Guardados;
