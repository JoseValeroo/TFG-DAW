import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Repeat2, Heart, BarChart2, Share, Image, Smile } from 'lucide-react';
import Sidebar from './components/layout/Sidebar';
import RightSidebar from './components/layout/RightSidebar';
import { feedApi } from './services/api';
import { useAuth } from './context/auth-context';
import './App.css';

// Tiempo relativo simple a partir de una fecha ISO.
function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (Number.isNaN(diff)) return '';
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

function Post({ author, text, createdAt, likes, retweets, comments }) {
  return (
    <article className="x-post">
      <span className="x-avatar">{(author?.name || '?').charAt(0).toUpperCase()}</span>
      <div className="x-post-body">
        <div className="x-post-head">
          <strong>{author?.name}</strong>
          <span className="x-muted">@{author?.handle}</span>
          <span className="x-muted">· {timeAgo(createdAt)}</span>
        </div>
        <p className="x-post-text">{text}</p>
        <div className="x-post-actions">
          <button type="button" className="x-action comment"><MessageCircle size={18} /><span>{comments}</span></button>
          <button type="button" className="x-action retweet"><Repeat2 size={18} /><span>{retweets}</span></button>
          <button type="button" className="x-action like"><Heart size={18} /><span>{likes}</span></button>
          <button type="button" className="x-action views"><BarChart2 size={18} /><span>{Math.max(likes, retweets, comments) * 7}</span></button>
          <button type="button" className="x-action share" aria-label="Compartir"><Share size={18} /></button>
        </div>
      </div>
    </article>
  );
}

function App() {
  const [tab, setTab] = useState('paraTi');
  const [draft, setDraft] = useState('');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [posting, setPosting] = useState(false);

  const { isAuthenticated, token, user } = useAuth();
  const navigate = useNavigate();

  const loadFeed = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (tab === 'siguiendo') {
        if (!isAuthenticated) {
          setPosts([]);
          setError('Inicia sesión para ver los posts de las cuentas que sigues.');
          return;
        }
        setPosts(await feedApi.following(token));
      } else {
        setPosts(await feedApi.forYou());
      }
    } catch {
      setError('No se pudo cargar el feed. ¿Está el backend en marcha?');
    } finally {
      setLoading(false);
    }
  }, [tab, isAuthenticated, token]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const handlePost = async () => {
    const text = draft.trim();
    if (!text) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setPosting(true);
    try {
      const newTweet = await feedApi.create(text, token);
      setDraft('');
      if (tab === 'paraTi') {
        setPosts((prev) => [newTweet, ...prev]);
      }
    } catch (err) {
      setError(err.message || 'No se pudo publicar el tweet.');
    } finally {
      setPosting(false);
    }
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
          <span className="x-avatar">{(user?.username || 'L').charAt(0).toUpperCase()}</span>
          <div className="x-compose-body">
            <textarea
              placeholder={isAuthenticated ? '¿Qué está pasando?' : 'Inicia sesión para publicar…'}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={200}
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
                disabled={posting || !draft.trim()}
              >
                {posting ? 'Publicando…' : 'Postear'}
              </button>
            </div>
          </div>
        </div>

        <div className="x-feed">
          {loading && <p className="x-feed-msg">Cargando…</p>}
          {!loading && error && <p className="x-feed-msg">{error}</p>}
          {!loading && !error && posts.length === 0 && (
            <p className="x-feed-msg">No hay nada por aquí todavía.</p>
          )}
          {!loading &&
            !error &&
            posts.map((post) => <Post key={post.id} {...post} />)}
        </div>
      </main>

      <RightSidebar />
    </div>
  );
}

export default App;
