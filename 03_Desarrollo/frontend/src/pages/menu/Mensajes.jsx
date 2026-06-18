import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import { messagesApi, feedApi } from '../../services/api';
import { useAuth } from '../../context/auth-context';
import './Mensajes.css';

function Mensajes() {
  const { token } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [people, setPeople] = useState([]); // sugerencias para iniciar chat
  const [active, setActive] = useState(null); // { userId, name, handle }
  const [thread, setThread] = useState([]);
  const [draft, setDraft] = useState('');

  const loadConversations = useCallback(() => {
    messagesApi.conversations(token).then(setConversations).catch(() => {});
  }, [token]);

  useEffect(() => {
    loadConversations();
    feedApi.suggestions().then(setPeople).catch(() => {});
  }, [loadConversations]);

  const openChat = async (person) => {
    setActive(person);
    try {
      setThread(await messagesApi.thread(person.userId, token));
    } catch {
      setThread([]);
    }
  };

  const send = async () => {
    const content = draft.trim();
    if (!content || !active) return;
    try {
      const msg = await messagesApi.send(active.userId, content, token);
      setThread((prev) => [...prev, msg]);
      setDraft('');
      loadConversations();
    } catch {
      /* noop */
    }
  };

  if (active) {
    return (
      <AppShell title={`Mensaje · ${active.name}`}>
        <button type="button" className="msg-back" onClick={() => setActive(null)}>
          <ArrowLeft size={16} /> Volver
        </button>
        <div className="msg-thread">
          {thread.length === 0 && <p className="shell-empty">Aún no hay mensajes. ¡Escribe el primero!</p>}
          {thread.map((m) => (
            <div key={m.id} className={`msg-bubble ${m.fromMe ? 'mine' : 'theirs'}`}>
              {m.content}
            </div>
          ))}
        </div>
        <div className="msg-compose">
          <input
            className="field-input"
            placeholder="Escribe un mensaje…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
          />
          <button type="button" className="pill-btn" onClick={send} disabled={!draft.trim()}>
            <Send size={16} />
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Mensajes">
      {conversations.length > 0 && <h3 className="msg-section">Conversaciones</h3>}
      {conversations.map((c) => (
        <button key={c.userId} type="button" className="panel msg-conv" onClick={() => openChat(c)}>
          <span className="gradient-avatar">{(c.name || '?').charAt(0).toUpperCase()}</span>
          <div className="msg-conv-info">
            <strong>{c.name}</strong>
            <span className="muted">{c.lastMessage}</span>
          </div>
        </button>
      ))}

      <h3 className="msg-section">Nuevo mensaje</h3>
      {people.map((p) => (
        <button
          key={p.id}
          type="button"
          className="panel msg-conv"
          onClick={() => openChat({ userId: p.id, name: p.name, handle: p.handle })}
        >
          <span className="gradient-avatar">{(p.name || '?').charAt(0).toUpperCase()}</span>
          <div className="msg-conv-info">
            <strong>{p.name}</strong>
            <span className="muted">@{p.handle}</span>
          </div>
        </button>
      ))}
    </AppShell>
  );
}

export default Mensajes;
