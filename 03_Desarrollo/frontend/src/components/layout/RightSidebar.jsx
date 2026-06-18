import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { feedApi } from '../../services/api';
import './RightSidebar.css';

function RightSidebar() {
  const [trends, setTrends] = useState([]);
  const [whoToFollow, setWhoToFollow] = useState([]);

  useEffect(() => {
    let active = true;
    feedApi.trends().then((t) => active && setTrends(t)).catch(() => {});
    feedApi.suggestions().then((s) => active && setWhoToFollow(s)).catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <aside className="x-right">
      <div className="x-right-inner">
        <div className="x-search">
          <Search size={18} />
          <input type="text" placeholder="Buscar" aria-label="Buscar" />
        </div>

        <section className="x-card">
          <h2>Suscríbete a Premium</h2>
          <p>Suscríbete para desbloquear nuevas funciones y, si reúnes los requisitos, recibir ingresos.</p>
          <button type="button" className="x-pill">Suscribirse</button>
        </section>

        <section className="x-card">
          <h2>Qué está pasando</h2>
          {trends.length === 0 && <p className="x-muted-sm">Sin tendencias.</p>}
          {trends.map((t) => (
            <div key={t.name} className="x-trend">
              <span className="x-trend-scope">Tendencia</span>
              <strong className="x-trend-title">{t.name}</strong>
              <span className="x-trend-posts">{t.posts} posts</span>
            </div>
          ))}
        </section>

        <section className="x-card">
          <h2>A quién seguir</h2>
          {whoToFollow.length === 0 && <p className="x-muted-sm">Sin sugerencias.</p>}
          {whoToFollow.map((u) => (
            <div key={u.id} className="x-follow">
              <span className="x-avatar">{(u.name || '?').charAt(0).toUpperCase()}</span>
              <div className="x-follow-info">
                <strong>{u.name}</strong>
                <span>@{u.handle}</span>
              </div>
              <button type="button" className="x-pill x-pill-dark">Seguir</button>
            </div>
          ))}
        </section>
      </div>
    </aside>
  );
}

export default RightSidebar;
