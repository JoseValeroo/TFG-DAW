import { useState } from 'react';
import { MessageCircle, Repeat2, Heart, BarChart2, Share, Image, Smile } from 'lucide-react';
import Sidebar from './components/layout/Sidebar';
import RightSidebar from './components/layout/RightSidebar';
import './App.css';

const postsParaTi = [
  {
    id: 1,
    name: 'Vite',
    handle: '@vite_js',
    time: '2h',
    text: 'Vite 8 ya está aquí: builds aún más rápidos con Rolldown. ⚡',
    stats: { comments: 128, retweets: 512, likes: '3,4 mil', views: '120 mil' },
  },
  {
    id: 2,
    name: 'React',
    handle: '@reactjs',
    time: '5h',
    text: 'Los Server Components y Suspense hacen que dividir tu app en chunks sea trivial. Tu bundle inicial lo agradece.',
    stats: { comments: 89, retweets: 240, likes: '1,9 mil', views: '88 mil' },
  },
  {
    id: 3,
    name: 'José Valero',
    handle: '@josevalero',
    time: '8h',
    text: '¡Mi red social Lure ya conecta el frontend React con un backend .NET + SQL Server! 🚀 #TFG #DAW',
    stats: { comments: 42, retweets: 96, likes: 730, views: '21 mil' },
  },
  {
    id: 4,
    name: 'GitHub',
    handle: '@github',
    time: '12h',
    text: 'Recordatorio: un buen README y unos tests verdes valen más que mil palabras en tu portfolio.',
    stats: { comments: 210, retweets: 1500, likes: '9,1 mil', views: '340 mil' },
  },
];

const postsSiguiendo = [
  {
    id: 101,
    name: '.NET',
    handle: '@dotnet',
    time: '1h',
    text: '.NET 10 LTS: rendimiento, Minimal APIs y EF Core mejor que nunca. Conecta con LocalDB en segundos.',
    stats: { comments: 64, retweets: 320, likes: '2,2 mil', views: '95 mil' },
  },
  {
    id: 102,
    name: 'Lure',
    handle: '@lure',
    time: '3h',
    text: 'Bienvenido a tu feed de "Siguiendo". Aquí verás los posts de las cuentas que sigues. 👀',
    stats: { comments: 12, retweets: 30, likes: 180, views: '4.200' },
  },
];

function Post({ name, handle, time, text, stats }) {
  return (
    <article className="x-post">
      <span className="x-avatar">{name.charAt(0)}</span>
      <div className="x-post-body">
        <div className="x-post-head">
          <strong>{name}</strong>
          <span className="x-muted">{handle}</span>
          <span className="x-muted">· {time}</span>
        </div>
        <p className="x-post-text">{text}</p>
        <div className="x-post-actions">
          <button type="button" className="x-action comment">
            <MessageCircle size={18} />
            <span>{stats.comments}</span>
          </button>
          <button type="button" className="x-action retweet">
            <Repeat2 size={18} />
            <span>{stats.retweets}</span>
          </button>
          <button type="button" className="x-action like">
            <Heart size={18} />
            <span>{stats.likes}</span>
          </button>
          <button type="button" className="x-action views">
            <BarChart2 size={18} />
            <span>{stats.views}</span>
          </button>
          <button type="button" className="x-action share" aria-label="Compartir">
            <Share size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}

function App() {
  const [tab, setTab] = useState('paraTi');
  const [draft, setDraft] = useState('');

  const posts = tab === 'paraTi' ? postsParaTi : postsSiguiendo;

  const handlePost = () => {
    setDraft('');
  };

  return (
    <div className="x-layout">
      <Sidebar />

      <main className="x-main">
        <header className="x-main-header">
          <h1>Inicio</h1>
          <div className="x-tabs">
            <button
              type="button"
              className={`x-tab ${tab === 'paraTi' ? 'active' : ''}`}
              onClick={() => setTab('paraTi')}
            >
              <span>Para ti</span>
            </button>
            <button
              type="button"
              className={`x-tab ${tab === 'siguiendo' ? 'active' : ''}`}
              onClick={() => setTab('siguiendo')}
            >
              <span>Siguiendo</span>
            </button>
          </div>
        </header>

        <div className="x-compose">
          <span className="x-avatar">L</span>
          <div className="x-compose-body">
            <textarea
              placeholder="¿Qué está pasando?"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={2}
            />
            <div className="x-compose-bar">
              <div className="x-compose-icons">
                <button type="button" aria-label="Añadir imagen"><Image size={20} /></button>
                <button type="button" aria-label="Añadir emoji"><Smile size={20} /></button>
              </div>
              <button
                type="button"
                className="x-post-submit"
                onClick={handlePost}
                disabled={!draft.trim()}
              >
                Postear
              </button>
            </div>
          </div>
        </div>

        <div className="x-feed">
          {posts.map((post) => (
            <Post key={post.id} {...post} />
          ))}
        </div>
      </main>

      <RightSidebar />
    </div>
  );
}

export default App;
