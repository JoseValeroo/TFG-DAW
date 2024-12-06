import React from 'react';
import { Card, Avatar, List, Button, Row, Col, Tag } from 'antd';
import { 
  MailOutlined, 
  EnvironmentOutlined, 
  CalendarOutlined, 
  TeamOutlined, 
  LikeOutlined, 
  CommentOutlined, 
  ShareAltOutlined, 
  SaveOutlined 
} from '@ant-design/icons';
import 'antd/dist/reset.css'; // Importa los estilos de Ant Design
import './profile.css'; // Importa el archivo CSS

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
  const profileData = {
    avatar: "https://via.placeholder.com/150",
    coverPhoto: "https://via.placeholder.com/300x150",
    name: "John Doe",
    bio: "Full Stack Developer",
    location: "San Francisco, CA",
    birthday: "15 de agosto de 1990",
    followers: 1200,
    following: 300,
    email: "john.doe@example.com",
  };

  const seguidores = [
    { id: 1, nombre: 'Juan Pérez', foto: 'https://i.pravatar.cc/150?img=1' },
    { id: 2, nombre: 'María López', foto: 'https://i.pravatar.cc/150?img=2' },
  ];

  const seguidos = [
    { id: 1, nombre: 'Ana Martín', foto: 'https://i.pravatar.cc/150?img=4' },
    { id: 2, nombre: 'Pedro Ruiz', foto: 'https://i.pravatar.cc/150?img=5' }, 
  ];

  return (
    <div className="profile-page">
      <div className="content">
        {/* Card 1: Imagen y datos del usuario */}
        <div className="profile-card" style={{ display: 'flex', flexDirection: 'column', height: '50%' }}>
          <Card
            style={{ height: '100%', width: '100%' }}
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
                      <Button type="text" icon={<LikeOutlined />} />,
                      <Button type="text" icon={<CommentOutlined />} />,
                      <Button type="text" icon={<ShareAltOutlined />} />,
                      <Button type="text" icon={<SaveOutlined />} />,
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
          <div className="media-content-card" style={{ display: 'flex', gap: '20px' }}>
            <Card title="Contenido Multimedia" style={{ width: '50%' }}>
              <video controls style={{ width: '70%', display:'flex'}}>
                <source src="" type="video/mp4" />
                Tu navegador no soporta el elemento de video.
              </video>
            </Card>
            <Card title="Seguidores y Seguidos" style={{ width: '50%' }}>
              <Row gutter={[16, 16]}>
                {/* Seguidores */}
                <Col span={12}>
                  <h4>Seguidores</h4>
                  <List
                    dataSource={seguidores}
                    renderItem={item => (
                      <List.Item
                        actions={[<Button type="primary" shape="round">Seguir</Button>]}
                      >
                        <List.Item.Meta
                          avatar={<Avatar src={item.foto} />}
                          title={item.nombre}
                          description={<span>@{item.nombre.toLowerCase().replace(' ', '')}</span>}
                        />
                      </List.Item>
                    )}
                  />
                </Col>

                {/* Seguidos */}
                <Col span={12}>
                  <h4>Seguidos</h4>
                  <List
                    dataSource={seguidos}
                    renderItem={item => (
                      <List.Item
                        actions={[<Button type="default" shape="round">Dejar Seguir</Button>]}
                      >
                        <List.Item.Meta
                          avatar={<Avatar src={item.foto} />}
                          title={item.nombre}
                          description={<span>@{item.nombre.toLowerCase().replace(' ', '')}</span>}
                        />
                      </List.Item>
                    )}
                  />
                </Col>
              </Row>
            </Card>
          </div>

          {/* Cards de Logros, Intereses y Estadísticas */}
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'nowrap' }} className="mid-cards">
            <div className="achievements-card">
              <Card title="Logros">
                <ul>
                  <li>Certificación en AWS</li>
                  <li>1000+ estrellas en proyectos de GitHub</li>
                  <li>Finalista en hackatón de Google</li>
                </ul>
              </Card>
            </div>

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

            <div className="stats-card">
              <Card title="Estadísticas de Actividad">
                <ul>
                  <li>Publicaciones: 35</li>
                  <li>Comentarios: 120</li>
                  <li>Interacciones: 500</li>
                </ul>
              </Card>
            </div>

            {/* Nueva Card: Habilidades */}
            <div className="skills-card">
              <Card title="Habilidades">
                <ul>
                  <li>React.js</li>
                  <li>Node.js</li>
                  <li>MongoDB</li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
