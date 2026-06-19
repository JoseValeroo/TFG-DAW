import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Avatar, List, Button, Tag, Tabs, Row, Col, Menu, Badge, ConfigProvider, theme } from 'antd';
import {
  HomeOutlined,
  MailOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  TeamOutlined,
  LikeOutlined,
  LikeFilled,
  RetweetOutlined,
  CommentOutlined,
  ShareAltOutlined,
  SaveOutlined,
  SettingOutlined,
  MessageOutlined,
  BellOutlined,
  StopOutlined,
  UsergroupAddOutlined,
  UserOutlined,
  EditOutlined,
} from '@ant-design/icons';
import 'antd/dist/reset.css';
import './profile.css';
import { useAuth } from '../../context/auth-context';
import { profileApi, feedApi } from '../../services/api';

const { Meta } = Card;

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (Number.isNaN(diff)) return '';
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

// Lista editable de strings (añadir / editar / eliminar).
function EditList({ items, onChange, placeholder }) {
  return (
    <div className="edit-list">
      {items.map((value, idx) => (
        <div key={idx} className="edit-list-row">
          <input
            className="profile-edit-input"
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(items.map((x, i) => (i === idx ? e.target.value : x)))}
          />
          <button type="button" className="edit-remove" onClick={() => onChange(items.filter((_, i) => i !== idx))}>✕</button>
        </div>
      ))}
      <button type="button" className="edit-add" onClick={() => onChange([...items, ''])}>+ Añadir</button>
    </div>
  );
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const { token, logout, updateUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [mainTab, setMainTab] = useState('posts');
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState('');

  const loadProfile = useCallback(() => {
    profileApi.me(token).then(setProfile).catch(() => {});
  }, [token]);

  useEffect(() => {
    loadProfile();
    profileApi.followers(token).then(setFollowers).catch(() => {});
    profileApi.following(token).then(setFollowing).catch(() => {});
  }, [token, loadProfile]);

  const loadItems = useCallback(async () => {
    setLoadingItems(true);
    try {
      if (mainTab === 'posts') setItems(await profileApi.tweets(token));
      else if (mainTab === 'replies') setItems(await profileApi.replies(token));
      else setItems(await profileApi.likes(token));
    } catch {
      setItems([]);
    } finally {
      setLoadingItems(false);
    }
  }, [mainTab, token]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleLike = async (id) => {
    try {
      const res = await feedApi.toggleLike(id, token);
      setItems((prev) => prev.map((p) => (p.id === id ? { ...p, likes: res.likes, likedByMe: res.liked } : p)));
    } catch {
      /* noop */
    }
  };

  const toggleRetweet = async (id) => {
    try {
      const res = await feedApi.toggleRetweet(id, token);
      setItems((prev) => prev.map((p) => (p.id === id ? { ...p, retweets: res.retweets, retweetedByMe: res.retweeted } : p)));
    } catch {
      /* noop */
    }
  };

  const toggleSave = async (id) => {
    try {
      const res = await feedApi.toggleSave(id, token);
      setItems((prev) => prev.map((p) => (p.id === id ? { ...p, savedByMe: res.saved } : p)));
    } catch {
      /* noop */
    }
  };

  const toggleFollow = async (id, setList) => {
    try {
      const res = await feedApi.follow(id, token);
      setList((prev) => prev.map((u) => (u.id === id ? { ...u, followedByMe: res.following } : u)));
    } catch {
      /* noop */
    }
  };

  const handlePost = async () => {
    const text = draft.trim();
    if (!text) return;
    try {
      const tweet = await feedApi.create(text, token);
      setDraft('');
      setProfile((p) => (p ? { ...p, tweetsCount: (p.tweetsCount ?? 0) + 1 } : p));
      if (mainTab === 'posts') setItems((prev) => [tweet, ...prev]);
    } catch {
      /* noop */
    }
  };

  const startEdit = () => {
    setForm({
      name: profile?.name ?? '',
      bio: profile?.bio ?? '',
      location: profile?.location ?? '',
      birthday: profile?.birthdayIso ?? '',
      logros: [...(profile?.logros ?? [])],
      intereses: [...(profile?.intereses ?? [])],
      habilidades: [...(profile?.habilidades ?? [])],
    });
    setEditing(true);
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      const updated = await profileApi.update(form, token);
      setProfile(updated);
      setEditing(false);
      setForm(null);
    } catch {
      /* noop */
    } finally {
      setSaving(false);
    }
  };

  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const onAvatarFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const updated = await profileApi.uploadAvatar(file, token);
      setProfile(updated);
      updateUser({ avatarUrl: updated.avatarUrl });
    } catch {
      /* noop */
    }
  };

  const data = {
    name: profile?.name ?? 'Usuario',
    bio: profile?.bio || 'Sin biografía',
    location: profile?.location || '—',
    birthday: profile?.birthday || '—',
    email: profile?.email || '—',
    followers: profile?.followers ?? 0,
    following: profile?.following ?? 0,
    logros: profile?.logros ?? [],
    intereses: profile?.intereses ?? [],
    habilidades: profile?.habilidades ?? [],
  };

  const renderMedia = (t) => {
    if (!t.mediaType || !t.mediaUrl) return null;
    if (t.mediaType === 'image') return <img className="profile-media" src={t.mediaUrl} alt="adjunto" loading="lazy" />;
    if (t.mediaType === 'video') return <video className="profile-media" src={t.mediaUrl} controls preload="metadata" />;
    if (t.mediaType === 'pdf') return <a className="profile-pdf" href={t.mediaUrl} target="_blank" rel="noreferrer">📄 Ver documento PDF</a>;
    return null;
  };

  const renderTweetItem = (t) => (
    <List.Item
      actions={[
        <Button key="like" type="text" icon={t.likedByMe ? <LikeFilled style={{ color: '#f91880' }} /> : <LikeOutlined />} onClick={() => toggleLike(t.id)}>{t.likes}</Button>,
        <Button key="rt" type="text" icon={<RetweetOutlined style={t.retweetedByMe ? { color: '#00ba7c' } : undefined} />} onClick={() => toggleRetweet(t.id)}>{t.retweets}</Button>,
        <Button key="comment" type="text" icon={<CommentOutlined />}>{t.comments}</Button>,
        <Button key="save" type="text" icon={<SaveOutlined style={t.savedByMe ? { color: '#1d9bf0' } : undefined} />} onClick={() => toggleSave(t.id)} />,
        <Button key="share" type="text" icon={<ShareAltOutlined />} />,
      ]}
    >
      <List.Item.Meta
        avatar={<Avatar src={t.author?.avatarUrl || undefined}>{(t.author?.name || '?').charAt(0).toUpperCase()}</Avatar>}
        title={<span>{t.author?.name} <span className="muted-inline">@{t.author?.handle} · {timeAgo(t.createdAt)}</span></span>}
        description={<div><span style={{ color: '#e7e9ea' }}>{t.text}</span>{renderMedia(t)}</div>}
      />
    </List.Item>
  );

  const renderReplyItem = (r) => (
    <List.Item>
      <List.Item.Meta
        title={<span className="muted-inline">En respuesta a @{r.tweetAuthorHandle}</span>}
        description={<><div className="reply-quote">{r.tweetText}</div><div className="reply-text">{r.text}</div></>}
      />
    </List.Item>
  );

  const renderMain = () => {
    if (loadingItems) return <p className="profile-empty">Cargando…</p>;
    if (items.length === 0) {
      const msg = mainTab === 'posts' ? 'Todavía no has publicado nada.'
        : mainTab === 'replies' ? 'No has respondido a ningún tweet.'
          : 'No has dado me gusta a ningún tweet.';
      return <p className="profile-empty">{msg}</p>;
    }
    return <List itemLayout="horizontal" dataSource={items} renderItem={mainTab === 'replies' ? renderReplyItem : renderTweetItem} />;
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: { colorPrimary: '#7c5cff', colorBgContainer: '#121316', colorBorderSecondary: 'rgba(255,255,255,0.07)', colorText: '#e7e9ea', borderRadius: 16 },
      }}
    >
    <div className="profile-page">
      <div className="profile-toolbar">
        {!editing ? (
          <Button icon={<EditOutlined />} onClick={startEdit}>Editar perfil</Button>
        ) : (
          <>
            <Button type="primary" loading={saving} onClick={saveEdit}>Guardar</Button>
            <Button onClick={() => { setEditing(false); setForm(null); }}>Cancelar</Button>
          </>
        )}
      </div>

      <div className="content">
        {/* Card 1: Imagen y datos del usuario */}
        <div className="profile-card">
          <Card style={{ height: '100%', width: '100%' }} cover={<div className="profile-cover" />}>
            {editing ? (
              <div className="edit-fields">
                <Avatar size={68} className="profile-avatar" src={profile?.avatarUrl || undefined}>{(data.name || '?').charAt(0).toUpperCase()}</Avatar>
                <label className="edit-label">Foto de perfil</label>
                <input type="file" accept="image/*" className="profile-edit-input" onChange={onAvatarFile} />
                <label className="edit-label">Nombre</label>
                <input className="profile-edit-input" value={form.name} onChange={(e) => setField('name', e.target.value)} />
                <label className="edit-label">Biografía</label>
                <textarea className="profile-edit-input" rows={3} maxLength={280} value={form.bio} onChange={(e) => setField('bio', e.target.value)} />
                <label className="edit-label">Ubicación</label>
                <input className="profile-edit-input" value={form.location} onChange={(e) => setField('location', e.target.value)} />
                <label className="edit-label">Fecha de nacimiento</label>
                <input className="profile-edit-input" type="date" value={form.birthday} onChange={(e) => setField('birthday', e.target.value)} />
              </div>
            ) : (
              <>
                <Meta
                  avatar={<Avatar size={68} className="profile-avatar" src={profile?.avatarUrl || undefined}>{(data.name || '?').charAt(0).toUpperCase()}</Avatar>}
                  title={data.name}
                  description={data.bio}
                />
                <List itemLayout="horizontal">
                  <List.Item><List.Item.Meta avatar={<EnvironmentOutlined />} title="Ubicación" description={data.location} /></List.Item>
                  <List.Item><List.Item.Meta avatar={<CalendarOutlined />} title="Fecha de nacimiento" description={data.birthday} /></List.Item>
                  <List.Item><List.Item.Meta avatar={<MailOutlined />} title="Correo" description={<a href={`mailto:${data.email}`}>{data.email}</a>} /></List.Item>
                  <List.Item><List.Item.Meta avatar={<TeamOutlined />} title="Seguidores y seguidos" description={`${data.followers} seguidores · ${data.following} seguidos`} /></List.Item>
                </List>
              </>
            )}
          </Card>
          <div className="about-card">
            <Card title="Sobre mí">
              <p>{data.bio}</p>
            </Card>
          </div>
        </div>

        {/* Cards adicionales */}
        <div className="other-cards">
          {/* Crear publicación */}
          <div className="posts-card">
            <Card title="Crear publicación">
              <div className="profile-compose">
                <textarea
                  className="profile-edit-input"
                  rows={2}
                  maxLength={200}
                  placeholder="¿Qué está pasando?"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                />
                <Button type="primary" onClick={handlePost} disabled={!draft.trim()}>Postear</Button>
              </div>
            </Card>
          </div>

          {/* Actividad: Posts / Respuestas / Me gusta */}
          <div className="posts-card">
            <Card title="Actividad">
              <Tabs
                activeKey={mainTab}
                onChange={setMainTab}
                items={[
                  { key: 'posts', label: `Posts (${profile?.tweetsCount ?? 0})` },
                  { key: 'replies', label: `Respuestas (${profile?.repliesCount ?? 0})` },
                  { key: 'likes', label: `Me gusta (${profile?.likesCount ?? 0})` },
                ]}
              />
              {renderMain()}
            </Card>
          </div>

          {/* Seguidores/Seguidos */}
          <div className="profile-row">
            <div className="media-content-card">
              <Card style={{ width: '100%' }}>
                <Tabs
                  defaultActiveKey="1"
                  centered
                  items={[
                    {
                      key: '1', label: `Seguidores (${data.followers})`,
                      children: (
                        <List dataSource={followers} locale={{ emptyText: 'Sin seguidores' }}
                          renderItem={(item) => (
                            <List.Item actions={[
                              <Button key="seguir" type={item.followedByMe ? 'default' : 'primary'} shape="round" onClick={() => toggleFollow(item.id, setFollowers)}>
                                {item.followedByMe ? 'Siguiendo' : 'Seguir'}
                              </Button>,
                            ]}>
                              <List.Item.Meta avatar={<Avatar>{(item.name || '?').charAt(0).toUpperCase()}</Avatar>} title={item.name} description={<span>@{item.handle}</span>} />
                            </List.Item>
                          )} />
                      ),
                    },
                    {
                      key: '2', label: `Seguidos (${data.following})`,
                      children: (
                        <List dataSource={following} locale={{ emptyText: 'No sigues a nadie' }}
                          renderItem={(item) => (
                            <List.Item actions={[
                              <Button key="dejar" type={item.followedByMe ? 'default' : 'primary'} shape="round" onClick={() => toggleFollow(item.id, setFollowing)}>
                                {item.followedByMe ? 'Dejar de seguir' : 'Seguir'}
                              </Button>,
                            ]}>
                              <List.Item.Meta avatar={<Avatar>{(item.name || '?').charAt(0).toUpperCase()}</Avatar>} title={item.name} description={<span>@{item.handle}</span>} />
                            </List.Item>
                          )} />
                      ),
                    },
                  ]}
                />
              </Card>
            </div>

            {/* Logros, Intereses, Estadísticas, Habilidades */}
            <div className="mid-cards">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={12}>
                  <div className="achievements-card">
                    <Card title="Logros">
                      {editing
                        ? <EditList items={form.logros} onChange={(v) => setField('logros', v)} placeholder="Un logro" />
                        : (data.logros.length ? <ul>{data.logros.map((l, i) => <li key={i}>{l}</li>)}</ul> : <p className="muted-inline">Sin logros.</p>)}
                    </Card>
                  </div>
                </Col>

                <Col xs={24} sm={12} lg={12}>
                  <div className="tags-card">
                    <Card title="Intereses">
                      {editing
                        ? <EditList items={form.intereses} onChange={(v) => setField('intereses', v)} placeholder="Un interés" />
                        : (data.intereses.length ? <div>{data.intereses.map((t, i) => <Tag key={i} color="blue">{t}</Tag>)}</div> : <p className="muted-inline">Sin intereses.</p>)}
                    </Card>
                  </div>
                </Col>

                <Col xs={24} sm={12} lg={12}>
                  <div className="stats-card">
                    <Card title="Estadísticas de Actividad">
                      <ul>
                        <li>Publicaciones: {profile?.tweetsCount ?? 0}</li>
                        <li>Respuestas: {profile?.repliesCount ?? 0}</li>
                        <li>Me gusta dados: {profile?.likesCount ?? 0}</li>
                      </ul>
                    </Card>
                  </div>
                </Col>

                <Col xs={24} sm={12} lg={12}>
                  <div className="skills-card">
                    <Card title="Habilidades">
                      {editing
                        ? <EditList items={form.habilidades} onChange={(v) => setField('habilidades', v)} placeholder="Una habilidad" />
                        : (data.habilidades.length ? <ul>{data.habilidades.map((s, i) => <li key={i}>{s}</li>)}</ul> : <p className="muted-inline">Sin habilidades.</p>)}
                    </Card>
                  </div>
                </Col>
              </Row>
            </div>
          </div>

          <div className="profile-menu-wrap">
            <Menu
              className="profile-menu"
              mode="horizontal"
              selectable={false}
              items={[
                { key: '0', icon: <HomeOutlined />, label: 'Inicio', onClick: () => navigate('/') },
                { key: '1', icon: <SettingOutlined />, label: 'Configuración', onClick: () => navigate('/configuracion') },
                { key: '2', icon: <MessageOutlined />, label: 'Mensajes', onClick: () => navigate('/mensajes') },
                { key: '3', icon: <Badge count={1}><BellOutlined /></Badge>, label: 'Notificaciones', onClick: () => navigate('/notificaciones') },
                { key: '4', icon: <UsergroupAddOutlined />, label: 'Comunidades', onClick: () => navigate('/comunidades') },
                { key: '5', icon: <UserOutlined />, label: 'Cuentas', onClick: () => navigate('/cuentas') },
                { key: '6', icon: <StopOutlined />, label: 'Cerrar Sesión', onClick: handleLogout },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
    </ConfigProvider>
  );
};

export default ProfilePage;
