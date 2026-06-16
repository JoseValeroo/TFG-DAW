import { Card, Avatar, List, Button, Tag, Tabs, Row, Col, Menu, Badge } from 'antd';
import { 
  MailOutlined, 
  EnvironmentOutlined, 
  CalendarOutlined, 
  TeamOutlined, 
  LikeOutlined, 
  CommentOutlined, 
  ShareAltOutlined, 
  SaveOutlined, 
  SettingOutlined,
  MessageOutlined,
  BellOutlined,
  StopOutlined,
  UsergroupAddOutlined,
  UserOutlined
} from '@ant-design/icons';
import 'antd/dist/reset.css'; // Importa los estilos de Ant Design
import './profile.css'; // Importa el archivo CSS
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth-context';

const { Meta } = Card;

const posts = [
  {
    title: "Post sobre React",
    description: "Cómo crear componentes reutilizables en React.",
    avatar: "https://via.placeholder.com/50",
  },
  {
    title: "Post sobre Node.js",
    description: "Buenas prácticas para construir APIs REST con Node.js.",
    avatar: "https://via.placeholder.com/50",
  },
  {
    title: "Post sobre DevOps",
    description: "Cómo implementar CI/CD en proyectos modernos.",
    avatar: "https://via.placeholder.com/50",
  },
];

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const profileData = {
    avatar: "https://via.placeholder.com/150",
    coverPhoto: "https://via.placeholder.com/300x150",
    // Datos reales del usuario autenticado (el resto sigue siendo de ejemplo).
    name: user?.username ?? "Usuario",
    bio: "Full Stack Developer",
    location: "San Francisco, CA",
    birthday: "15 de agosto de 1990",
    followers: 1200,
    following: 300,
    email: user?.email ?? "",
  };

  const seguidores = [
    { id: 1, nombre: 'Juan Pérez', foto: 'https://i.pravatar.cc/150?img=1' },
    { id: 2, nombre: 'María López', foto: 'https://i.pravatar.cc/150?img=2' },
    { id: 3, nombre: 'María López', foto: 'https://i.pravatar.cc/150?img=2' },
    { id: 4, nombre: 'María López', foto: 'https://i.pravatar.cc/150?img=2' },
  ];

  const seguidos = [
    { id: 1, nombre: 'Ana Martín', foto: 'https://i.pravatar.cc/150?img=4' },
    { id: 2, nombre: 'Pedro Ruiz', foto: 'https://i.pravatar.cc/150?img=5' }, 
    { id: 3, nombre: 'Pedro Ruiz', foto: 'https://i.pravatar.cc/150?img=5' }, 
    { id: 4, nombre: 'Ana Martín', foto: 'https://i.pravatar.cc/150?img=4' },
  ];

  return (
    <div className="profile-page">
      <div className="content">
        {/* Card 1: Imagen y datos del usuario */}
        <div className="profile-card" style={{ display: 'flex', flexDirection: 'column', height: '50%' }}>
          <Card
            style={{ height: '100%', width: '100%', marginTop:'-0.5vh'}}
            cover={<img alt="cover" src={profileData.coverPhoto} />}
          >
            <Meta
              avatar={<Avatar size={64} src={profileData.avatar} />}
              title={profileData.name}
              description={profileData.bio}
            />
            <List itemLayout="horizontal">
              <List.Item>
                <List.Item.Meta
                  avatar={<EnvironmentOutlined />}
                  title="Ubicación"
                  description={profileData.location}
                />
              </List.Item>
              <List.Item>
                <List.Item.Meta
                  avatar={<CalendarOutlined />}
                  title="Fecha de nacimiento"
                  description={profileData.birthday}
                />
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
              <p>
                Soy un desarrollador full stack con experiencia en tecnologías como React, Node.js, y bases de datos como MongoDB. Me especializo en la creación de aplicaciones web modernas y escalables, con un enfoque en la experiencia del usuario (UX). 
                <br />
                Tengo experiencia trabajando con APIs RESTful, integrando sistemas en la nube y utilizando prácticas de desarrollo ágil.
              </p>
            </Card>
          </div>
        </div>

        {/* Cards adicionales */}
        <div className="other-cards">
          {/* Card 4: Posts del usuario */}
          <div className="posts-card">
            <Card title="Posts">
              <List
                itemLayout="horizontal"
                dataSource={posts}
                renderItem={(post) => (
                  <List.Item
                    actions={[
                      <Button key="like" type="text" icon={<LikeOutlined />} />,
                      <Button key="comment" type="text" icon={<CommentOutlined />} />,
                      <Button key="share" type="text" icon={<ShareAltOutlined />} />,
                      <Button key="save" type="text" icon={<SaveOutlined />} />,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar src={post.avatar} />} 
                      title={<a href="#!">{post.title}</a>}
                      description={post.description}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </div>

          {/* Cards de Multimedia y Seguidores/Seguidos */}
          <div style={{display: 'flex', gap: '20px', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div className="media-content-card" style={{ display: 'flex', gap: '20px', width: '50%' }}>
              <Card style={{width:'100%'}}>
                <Tabs
                  defaultActiveKey="1"
                  centered
                  items={[
                    {
                      key: '1',
                      label: 'Seguidores',
                      children: (
                        <List
                          dataSource={seguidores}
                          renderItem={(item) => (
                            <List.Item
                              actions={[<Button key="seguir" type="primary" shape="round">Seguir</Button>]}
                            >
                              <List.Item.Meta
                                avatar={<Avatar src={item.foto} />}
                                title={item.nombre}
                                description={<span>@{item.nombre.toLowerCase().replace(' ', '')}</span>}
                              />
                            </List.Item>
                          )}
                        />
                      ),
                    },
                    {
                      key: '2',
                      label: 'Seguidos',
                      children: (
                        <List
                          dataSource={seguidos}
                          renderItem={(item) => (
                            <List.Item
                              actions={[<Button key="dejar" type="default" shape="round">Dejar Seguir</Button>]}
                            >
                              <List.Item.Meta
                                avatar={<Avatar src={item.foto} />}
                                title={item.nombre}
                                description={<span>@{item.nombre.toLowerCase().replace(' ', '')}</span>}
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
            <div className="mid-cards" style={{width:'50%', height:'10vh'}}>
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
                        <li>Publicaciones: 35</li>
                        <li>Comentarios: 120</li>
                        <li>Interacciones: 500</li>
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
          <div style={{display:'flex', justifyContent:'center'}}>
            <Menu
              mode="horizontal"
              selectable={false}
              style={{
                marginTop: '10px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                backgroundColor: '#fff',
                padding: '0 20px',
              }}
              items={[
                { key: '1', icon: <SettingOutlined />, label: 'Configuración' },
                { key: '2', icon: <MessageOutlined />, label: 'Mensajes' },
                { key: '3', icon: <Badge count={1}><BellOutlined /></Badge>, label: 'Notificaciones' },
                { key: '4', icon: <UsergroupAddOutlined />, label: 'Comunidades' },
                { key: '5', icon: <UserOutlined />, label: 'Cuentas' },
                { key: '6', icon: <StopOutlined />, label: 'Cerrar Sesión', onClick: handleLogout },
              ]}
            />
          </div>
        </div>
      </div>  
    </div>
  );
};

export default ProfilePage;
