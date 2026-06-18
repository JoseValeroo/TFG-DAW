import { Search } from 'lucide-react';
import './RightSidebar.css';

const trends = [
  { scope: 'Tecnología · Tendencia', title: 'React 19', posts: '24,5 mil posts' },
  { scope: 'Tendencia en España', title: '#DesarrolloWeb', posts: '8.912 posts' },
  { scope: 'Programación · Tendencia', title: 'TypeScript', posts: '12,1 mil posts' },
  { scope: 'Tendencia en España', title: '.NET 10', posts: '5.430 posts' },
];

const whoToFollow = [
  { name: 'Elon Musk', handle: '@elonmusk' },
  { name: 'GitHub', handle: '@github' },
  { name: 'Vite', handle: '@vite_js' },
];

function RightSidebar() {
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
          {trends.map((t) => (
            <div key={t.title} className="x-trend">
              <span className="x-trend-scope">{t.scope}</span>
              <strong className="x-trend-title">{t.title}</strong>
              <span className="x-trend-posts">{t.posts}</span>
            </div>
          ))}
        </section>

        <section className="x-card">
          <h2>A quién seguir</h2>
          {whoToFollow.map((u) => (
            <div key={u.handle} className="x-follow">
              <span className="x-avatar">{u.name.charAt(0)}</span>
              <div className="x-follow-info">
                <strong>{u.name}</strong>
                <span>{u.handle}</span>
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
