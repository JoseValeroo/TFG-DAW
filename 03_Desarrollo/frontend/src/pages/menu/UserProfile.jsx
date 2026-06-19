import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import TweetCard from '../../components/TweetCard';
import { usersApi, feedApi } from '../../services/api';
import { useAuth } from '../../context/auth-context';
import './UserProfile.css';

export default function UserProfile() {
  const { id } = useParams();
  const uid = Number(id);
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null); // { profile, followedByMe, isMe }
  const [tab, setTab] = useState('posts');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(() => {
    usersApi.get(uid, token)
      .then((d) => { setData(d); setFollowing(d.followedByMe); })
      .catch(() => setNotFound(true));
  }, [uid, token]);
  useEffect(load, [load]);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === 'posts') setItems(await usersApi.tweets(uid, token));
      else if (tab === 'replies') setItems(await usersApi.replies(uid, token));
      else setItems(await usersApi.likes(uid, token));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [tab, uid, token]);
  useEffect(() => { loadItems(); }, [loadItems]);

  const toggleFollow = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    const r = await feedApi.follow(uid, token);
    setFollowing(r.following);
    setData((d) => (d ? { ...d, profile: { ...d.profile, followers: r.followers } } : d));
  };

  const updateItem = (u) => setItems((prev) => prev.map((p) => (p.id === u.id ? u : p)));

  if (notFound) return <AppShell title="Perfil"><p className="shell-empty">Usuario no encontrado.</p></AppShell>;
  if (!data) return <AppShell title="Perfil"><p className="shell-empty">Cargando…</p></AppShell>;

  const p = data.profile;

  return (
    <AppShell title={p.name}>
      <div className="up-header panel">
        {p.avatarUrl
          ? <img className="up-avatar up-avatar-img" src={p.avatarUrl} alt={p.name} />
          : <span className="up-avatar">{(p.name || '?').charAt(0).toUpperCase()}</span>}
        <div className="up-info">
          <div className="up-toprow">
            <div>
              <h2 className="up-name">{p.name}</h2>
              <div className="muted">@{p.username}</div>
            </div>
            {data.isMe ? (
              <button type="button" className="pill-btn ghost" onClick={() => navigate('/profilePage')}>Editar perfil</button>
            ) : (
              <button type="button" className={`pill-btn ${following ? 'ghost' : ''}`} onClick={toggleFollow}>
                {following ? 'Siguiendo' : 'Seguir'}
              </button>
            )}
          </div>
          {p.bio && <p className="up-bio">{p.bio}</p>}
          <div className="up-meta muted">
            {p.location && <span>📍 {p.location} · </span>}
            <strong>{p.followers}</strong> seguidores · <strong>{p.following}</strong> seguidos
          </div>
        </div>
      </div>

      <div className="up-tabs">
        {[['posts', `Posts (${p.tweetsCount})`], ['replies', `Respuestas (${p.repliesCount})`], ['likes', `Me gusta (${p.likesCount})`]].map(([k, label]) => (
          <button key={k} type="button" className={`up-tab ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>{label}</button>
        ))}
      </div>

      {loading && <p className="shell-empty">Cargando…</p>}
      {!loading && items.length === 0 && <p className="shell-empty">Nada que mostrar.</p>}
      {!loading && tab === 'replies'
        ? items.map((r) => (
            <div key={r.id} className="panel">
              <div className="muted" style={{ fontSize: 13 }}>En respuesta a @{r.tweetAuthorHandle}</div>
              <div className="muted" style={{ fontStyle: 'italic', margin: '6px 0' }}>{r.tweetText}</div>
              <div>{r.text}</div>
            </div>
          ))
        : !loading && items.map((t) => (
            <TweetCard key={t.id} tweet={t} token={token} isAuth={isAuthenticated} onChange={updateItem} />
          ))}
    </AppShell>
  );
}
