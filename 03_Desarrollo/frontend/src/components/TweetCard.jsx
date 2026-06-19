import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Repeat2, Heart, Bookmark, Share } from 'lucide-react';
import { feedApi } from '../services/api';
import './TweetCard.css';

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (Number.isNaN(diff)) return '';
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

function Media({ type, url }) {
  if (!type || !url) return null;
  if (type === 'image') return <img className="tc-media" src={url} alt="adjunto" loading="lazy" />;
  if (type === 'video') return <video className="tc-media" src={url} controls preload="metadata" />;
  if (type === 'pdf') return <a className="tc-pdf" href={url} target="_blank" rel="noreferrer">📄 Ver documento PDF</a>;
  return null;
}

export default function TweetCard({ tweet, token, isAuth, onChange }) {
  const navigate = useNavigate();
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [draft, setDraft] = useState('');

  const requireAuth = () => {
    if (!isAuth) {
      navigate('/login');
      return false;
    }
    return true;
  };

  const openAuthor = () => {
    if (tweet.author?.id) navigate(`/usuario/${tweet.author.id}`);
  };

  const update = (patch) => onChange?.({ ...tweet, ...patch });

  const like = async () => {
    if (!requireAuth()) return;
    const r = await feedApi.toggleLike(tweet.id, token);
    update({ likes: r.likes, likedByMe: r.liked });
  };
  const retweet = async () => {
    if (!requireAuth()) return;
    const r = await feedApi.toggleRetweet(tweet.id, token);
    update({ retweets: r.retweets, retweetedByMe: r.retweeted });
  };
  const save = async () => {
    if (!requireAuth()) return;
    const r = await feedApi.toggleSave(tweet.id, token);
    update({ savedByMe: r.saved });
  };
  const toggleComments = async () => {
    const next = !showComments;
    setShowComments(next);
    if (next && comments.length === 0) {
      try {
        setComments(await feedApi.getComments(tweet.id));
      } catch {
        /* noop */
      }
    }
  };
  const submitComment = async () => {
    if (!requireAuth()) return;
    const text = draft.trim();
    if (!text) return;
    const c = await feedApi.addComment(tweet.id, text, token);
    setComments((prev) => [...prev, c]);
    setDraft('');
    update({ comments: (tweet.comments || 0) + 1 });
  };

  return (
    <article className="tc">
      {tweet.author?.avatarUrl
        ? <img className="tc-avatar tc-avatar-img" src={tweet.author.avatarUrl} alt={tweet.author.name} onClick={openAuthor} />
        : <span className="tc-avatar" onClick={openAuthor}>{(tweet.author?.name || '?').charAt(0).toUpperCase()}</span>}
      <div className="tc-body">
        <div className="tc-head">
          <strong className="tc-name" onClick={openAuthor}>{tweet.author?.name}</strong>
          <span className="tc-muted tc-clickable" onClick={openAuthor}>@{tweet.author?.handle}</span>
          <span className="tc-muted">· {timeAgo(tweet.createdAt)}</span>
        </div>
        <p className="tc-text">{tweet.text}</p>
        <Media type={tweet.mediaType} url={tweet.mediaUrl} />
        <div className="tc-actions">
          <button type="button" className="tc-action comment" onClick={toggleComments}><MessageCircle size={18} /><span>{tweet.comments}</span></button>
          <button type="button" className={`tc-action retweet ${tweet.retweetedByMe ? 'active' : ''}`} onClick={retweet}><Repeat2 size={18} /><span>{tweet.retweets}</span></button>
          <button type="button" className={`tc-action like ${tweet.likedByMe ? 'active' : ''}`} onClick={like}><Heart size={18} fill={tweet.likedByMe ? 'currentColor' : 'none'} /><span>{tweet.likes}</span></button>
          <button type="button" className={`tc-action save ${tweet.savedByMe ? 'active' : ''}`} onClick={save} aria-label="Guardar"><Bookmark size={18} fill={tweet.savedByMe ? 'currentColor' : 'none'} /></button>
          <button type="button" className="tc-action share" aria-label="Compartir"><Share size={18} /></button>
        </div>

        {showComments && (
          <div className="tc-comments">
            <div className="tc-comment-compose">
              <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Escribe una respuesta…" onKeyDown={(e) => e.key === 'Enter' && submitComment()} />
              <button type="button" onClick={submitComment} disabled={!draft.trim()}>Responder</button>
            </div>
            {comments.map((c) => (
              <div key={c.id} className="tc-comment">
                <strong>{c.author?.name}</strong> <span className="tc-muted">@{c.author?.handle}</span>
                <div>{c.text}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
