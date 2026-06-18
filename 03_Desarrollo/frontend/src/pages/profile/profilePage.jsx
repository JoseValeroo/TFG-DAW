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
  CommentOutlined,
  ShareAltOutlined,
  SaveOutlined,
  SettingOutlined,
  MessageOutlined,
  BellOutlined,
  StopOutlined,
  UsergroupAddOutlined,
  UserOutlined,
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

const ProfilePage = () => {
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  const [profile, setProfile] = useState(null);
  const [mainTab, setMainTab] = useState('posts');
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

  useEffect(() => {
    profileApi.me(token).then(setProfile).catch(() => {});
    profileApi.followers(token).then(setFollowers).catch(() => {});
    profileApi.following(token).then(setFollowing).catch(() => {});
  }, [token]);

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
      setItems((prev) =>
        prev.map((p) => (p.id === id ? { ...p, likes: res.likes, likedByMe: res.liked } : p)),
      );
    } catch {
      /* noop */
    }
  };

  const profileData = {
    name: profile?.name ?? 'Usuario',
    bio: profile?.bio || 'Sin biografía',
    location: profile?.location || '—',
    birthday: profile?.birthday || '—',
    email: profile?.email || '—',
    followers: profile?.followers ?? 0,
    following: profile?.following ?? 0,
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
        <Button
          key="like"
          type="text"
          icon={t.likedByMe ? <LikeFilled style={{ color: '#f91880' }} /> : <LikeOutlined />}
          onClick={() => toggleLike(t.id)}
        >
          {t.likes}
        </Button>,
        <Button key="comment" type="text" icon={<CommentOutlined />}>{t.comments}</Button>,
        <Button key="share" type="text" icon={<ShareAltOutlined />} />,
        <Button key="save" type="text" icon={<SaveOutlined />} />,
      ]}
    >
      <List.Item.Meta
        avatar={<Avatar src={t.author?.avatarUrl || undefined}>{(t.author?.name || '?').charAt(0).toUpperCase()}</Avatar>}
        title={<span>{t.author?.name} <span className="muted-inline">@{t.author?.handle} · {timeAgo(t.createdAt)}</span></span>}
        description={
          <div>
            <span style={{ color: '#e7e9ea' }}>{t.text}</span>
            {renderMedia(t)}
          </div>
        }
      />
    </List.Item>
  );

  const renderReplyItem = (r) => (
    <List.Item>
      <List.Item.Meta
        title={<span className="muted-inline">En respuesta a @{r.tweetAuthorHandle}</span>}
        description={
          <>
            <div className="reply-quote">{r.tweetText}</div>
            <div className="reply-text">{r.text}</div>
          </>
        }
      />
    </List.Item>
  );

  const renderMain = () => {
    if (loadingItems) return <p className="profile-empty">Cargando…</p>;
    if (items.length === 0) {
      const msg =
        mainTab === 'posts' ? 'Todavía no has publicado nada.'
          : mainTab === 'replies' ? 'No has respondido a ningún tweet.'
            : 'No has dado me gusta a ningún tweet.';
      return <p className="profile-empty">{msg}</p>;
    }
    return (
      <List
        itemLayout="horizontal"
        dataSource={items}
        renderItem={mainTab === 'replies' ? renderReplyItem : renderTweetItem}
      />
    );
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#7c5cff',
          colorBgContainer: '#121316',
          colorBorderSecondary: 'rgba(255,255,255,0.07)',
          colorText: '#e7e9ea',
          borderRadius: 16,
        },
      }}
    >
    <div className="profile-page">
      <div className="content">
        {/* Card 1: Imagen y datos del usuario */}
        <div className="profile-card">
          <Card
            style={{ height: '100%', width: '100%' }}
            cover={<div className="profile-cover" />}
          >
            <Meta
              avatar={<Avatar size={68} className="profile-avatar">{(profileData.name || '?').charAt(0).toUpperCase()}</Avatar>}
              title={profileData.name}
              description={profileData.bio}
            />
            <List itemLayout="horizontal">
              <List.Item>
                <List.Item.Meta avatar={<EnvironmentOutlined />} title="Ubicación" description={profileData.location} />
              </List.Item>
              <List.Item>
                <List.Item.Meta avatar={<CalendarOutlined />} title="Fecha de nacimiento" description={profileData.birthday} />
              </List.Item>
              <List.Item>
                <List.Item.Meta
                  avatar={<MailOutlined />}
                  title="Correo"
                  description={<a href={`mailto:${profileData.email}`}>{profileData.email}</a>}
                />
              </List.Item>
              <List.Item>
                <List.Item.Meta
                  avatar={<TeamOutlined />}
                  title="Seguidores y seguidos"
                  description={`${profileData.followers} seguidores · ${profileData.following} seguidos`}
                />
              </List.Item>
            </List>
          </Card>
          {/* Card 2: Descripción del usuario */}
          <div className="about-card">
            <Card title="Sobre mí">
              <p>{profileData.bio}</p>
            </Card>
          </div>
        </div>

        {/* Cards adicionales */}
        <div className="other-cards">
          {/* Card 4: Posts / Respuestas / Me gusta */}
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

          {/* Cards de Seguidores/Seguidos */}
          <div className="profile-row">
            <div className="media-content-card">
              <Card style={{ width: '100%' }}>
                <Tabs
                  defaultActiveKey="1"
                  centered
                  items={[
                    {
                      key: '1',
                      label: `Seguidores (${profileData.followers})`,
                      children: (
                        <List
                          dataSource={followers}
                          locale={{ emptyText: 'Sin seguidores' }}
                          renderItem={(item) => (
                            <List.Item actions={[<Button key="seguir" type="primary" shape="round">Seguir</Button>]}>
                              <List.Item.Meta
                                avatar={<Avatar>{(item.name || '?').charAt(0).toUpperCase()}</Avatar>}
                                title={item.name}
                                description={<span>@{item.handle}</span>}
                              />
                            </List.Item>
                          )}
                        />
                      ),
                    },
                    {
                      key: '2',
                      label: `Seguidos (${profileData.following})`,
                      children: (
                        <List
                          dataSource={following}
                          locale={{ emptyText: 'No sigues a nadie' }}
                          renderItem={(item) => (
                            <List.Item actions={[<Button key="dejar" type="default" shape="round">Dejar Seguir</Button>]}>
                              <List.Item.Meta
                                avatar={<Avatar>{(item.name || '?').charAt(0).toUpperCase()}</Avatar>}
                                title={item.name}
                                description={<span>@{item.handle}</span>}
                              />
                            </List.Item>
                          )}
                        />
                      ),
                    },
                  ]}
                />
              </Card>
            </div>

            {/* Cards de Logros, Intereses y Estadísticas */}
            <div className="mid-cards">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={12}>
                  <div className="achievements-card">
                    <Card title="Logros">
                      <ul>
                        <li>Certificación en AWS</li>
                        <li>1000+ estrellas en proyectos de GitHub</li>
                      </ul>
                    </Card>
                  </div>
                </Col>

                <Col xs={24} sm={12} lg={12}>
                  <div className="tags-card">
                    <Card title="Intereses">
                      <div>
                        <Tag color="blue">React</Tag>
                        <Tag color="green">Node.js</Tag>
                        <Tag color="purple">Diseño UX</Tag>
                        <Tag color="gold">Bases de Datos</Tag>
                        <Tag color="red">DevOps</Tag>
                        <Tag color="green">Node.js</Tag>
                        <Tag color="blue">JavaScript</Tag>
                        <Tag color="green">Python</Tag>
                        <Tag color="orange">Docker</Tag>
                        <Tag color="lime">Kubernetes</Tag>
                        <Tag color="gray">Cybersecurity</Tag>
                      </div>
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
                      <ul>
                        <li>React.js</li>
                        <li>Node.js</li>
                        <li>MongoDB</li>
                      </ul>
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
