import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import TweetCard from '../../components/TweetCard';
import { feedApi } from '../../services/api';
import { useAuth } from '../../context/auth-context';
import './Explorar.css';

function Explorar() {
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [trends, setTrends] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    feedApi.trends().then(setTrends).catch(() => {});
  }, []);

  const runSearch = async (q) => {
    const term = (q ?? query).trim();
    if (!term) {
      setResults(null);
      return;
    }
    setQuery(term);
    setLoading(true);
    try {
      setResults(await feedApi.search(term, token));
    } catch {
      setResults({ users: [], tweets: [] });
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setQuery('');
    setResults(null);
  };

  const updateTweet = (u) =>
    setResults((r) => (r ? { ...r, tweets: r.tweets.map((t) => (t.id === u.id ? u : t)) } : r));

  return (
    <AppShell title="Explorar">
      <form className="exp-search" onSubmit={(e) => { e.preventDefault(); runSearch(); }}>
        <Search size={18} />
        <input type="search" placeholder="Buscar en Lure" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Buscar" />
        {results !== null && <button type="button" className="exp-clear" onClick={clear}>Limpiar</button>}
      </form>

      {results !== null && (
        <>
          {loading && <p className="shell-empty">Buscando…</p>}
          {!loading && results.users.length === 0 && results.tweets.length === 0 && (
            <p className="shell-empty">Sin resultados para “{query}”.</p>
          )}

          {results.users.length > 0 && (
            <div className="panel">
              <h3 className="exp-h3">Cuentas</h3>
              {results.users.map((u) => (
                <button key={u.id} type="button" className="exp-user" onClick={() => navigate(`/usuario/${u.id}`)}>
                  <span className="gradient-avatar">{(u.name || '?').charAt(0).toUpperCase()}</span>
                  <div>
                    <strong>{u.name}</strong>
                    <div className="muted">@{u.handle}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {results.tweets.map((t) => (
            <TweetCard key={t.id} tweet={t} token={token} isAuth={isAuthenticated} onChange={updateTweet} />
          ))}
        </>
      )}

      {results === null && (
        <div className="panel">
          <h3 className="exp-h3"><TrendingUp size={18} /> Tendencias para ti</h3>
          {trends.length === 0 && <p className="muted">Sin tendencias.</p>}
          {trends.map((t, i) => (
            <button key={t.name} type="button" className="exp-trend" onClick={() => runSearch(t.name)}>
              <span className="exp-trend-rank">{i + 1} · Tendencia</span>
              <strong className="exp-trend-name">{t.name}</strong>
              <span className="muted">{t.posts} posts</span>
            </button>
          ))}
        </div>
      )}
    </AppShell>
  );
}

export default Explorar;
