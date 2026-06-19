import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { feedApi } from '../../services/api';
import { useAuth } from '../../context/auth-context';
import './RightSidebar.css';

function RightSidebar() {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();
  const [trends, setTrends] = useState([]);
  const [whoToFollow, setWhoToFollow] = useState([]);
  const [followed, setFollowed] = useState({});

  useEffect(() => {
    let active = true;
    feedApi.trends().then((t) => active && setTrends(t)).catch(() => {});
    feedApi.suggestions().then((s) => active && setWhoToFollow(s)).catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const follow = async (id) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const r = await feedApi.follow(id, token);
      setFollowed((prev) => ({ ...prev, [id]: r.following }));
    } catch {
      /* noop */
    }
  };

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
          <button type="button" className="x-pill" onClick={() => navigate('/premium')}>Suscribirse</button>
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
              <span className="x-avatar x-follow-clickable" onClick={() => navigate(`/usuario/${u.id}`)}>{(u.name || '?').charAt(0).toUpperCase()}</span>
              <div className="x-follow-info x-follow-clickable" onClick={() => navigate(`/usuario/${u.id}`)}>
                <strong>{u.name}</strong>
                <span>@{u.handle}</span>
              </div>
              <button type="button" className={`x-pill ${followed[u.id] ? '' : 'x-pill-dark'}`} onClick={() => follow(u.id)}>
                {followed[u.id] ? 'Siguiendo' : 'Seguir'}
              </button>
            </div>
          ))}
        </section>
      </div>
    </aside>
  );
}

export default RightSidebar;
