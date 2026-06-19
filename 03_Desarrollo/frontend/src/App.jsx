import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image, Smile } from 'lucide-react';
import Sidebar from './components/layout/Sidebar';
import RightSidebar from './components/layout/RightSidebar';
import TweetCard from './components/TweetCard';
import { feedApi } from './services/api';
import { useAuth } from './context/auth-context';
import './App.css';

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
        setPosts(await feedApi.forYou(token));
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

  const updatePost = (updated) => setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));

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
      if (tab === 'paraTi') setPosts((prev) => [newTweet, ...prev]);
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
            <button type="button" className={`x-tab ${tab === 'paraTi' ? 'active' : ''}`} onClick={() => setTab('paraTi')}><span>Para ti</span></button>
            <button type="button" className={`x-tab ${tab === 'siguiendo' ? 'active' : ''}`} onClick={() => setTab('siguiendo')}><span>Siguiendo</span></button>
          </div>
        </header>

        <div className="x-compose">
          {user?.avatarUrl
            ? <img className="x-avatar x-avatar-img" src={user.avatarUrl} alt={user.username} />
            : <span className="x-avatar">{(user?.username || 'L').charAt(0).toUpperCase()}</span>}
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
              <button type="button" className="x-post-submit" onClick={handlePost} disabled={posting || !draft.trim()}>
                {posting ? 'Publicando…' : 'Postear'}
              </button>
            </div>
          </div>
        </div>

        <div className="x-feed">
          {loading && <p className="x-feed-msg">Cargando…</p>}
          {!loading && error && <p className="x-feed-msg">{error}</p>}
          {!loading && !error && posts.length === 0 && <p className="x-feed-msg">No hay nada por aquí todavía.</p>}
          {!loading && !error && posts.map((post) => (
            <TweetCard key={post.id} tweet={post} token={token} isAuth={isAuthenticated} onChange={updatePost} />
          ))}
        </div>
      </main>

      <RightSidebar />
    </div>
  );
}

export default App;
