import { Link } from 'react-router-dom';
import '../TarjetaMain/TarjetaMain.css';
import elomusk from '../../assets/Image/elomusk.webp';

function TarjetaMain() {
  return (
    <div className="app">
      <aside className="sidebar">
        <nav>
          <ul>
            <li><Link to="/"><span>LURE</span></Link></li>
            <li><Link to="/"><span>Inicio</span></Link></li>
            <li><a href="#explorar"><span>Explorar</span></a></li>
            <li><a href="#notificaciones"><span>Notificaciones</span></a></li>
            <li><a href="#mensajes"><span>Mensajes</span></a></li>
            <li><a href="#guardados"><span>Guardados</span></a></li>
            <li><a href="#comunidades"><span>Comunidades</span></a></li>
            <li><a href="#premium"><span>Premium</span></a></li>
            <li><Link to="/profilePage"><span>Perfil</span></Link></li>
            <li><a href="#opciones"><span>Más opciones</span></a></li>
          </ul>
        </nav>
        <button className="post-button">
          <Link to="/login">Iniciar Sesión</Link>
        </button>
      </aside>

      <main className="main-content">
        <header>
          <h2>Para ti</h2>
          <div className="tabs">
            <span className="active">Para ti</span>
            <span>Siguiendo</span>
          </div>
        </header>
        <div className="post-form">
          <input type="text" placeholder="¿Qué está pasando?!" />
          <button className="post-button-pequeño">Postear</button>
        </div>
        <div className="posts">
          {/* Post simulado */}
          <div className="post">
            <img src={elomusk} alt="User" className="avatar" />
            <div className="post-content">
              <h3>No estás Registrado...</h3>
              <p>Contenido de tu post de ejemplo, no se si al modificar el contenido de este twit se cambia el contenedor.</p>
            </div>
          </div>
        </div>
      </main>

      <aside className="right-sidebar">
        <div className="search-bar">
          <input type="text" placeholder="Buscar" />
        </div>
        <div className="premium-offer">
          <h3>Oferta para premium!</h3>
          <p>Obtén hasta un 50% de descuento en X Premium</p>
          <button className="button-black-small">Suscribirse</button>
        </div>
        <div className="who-to-follow">
          <h3>A quién seguir</h3>
        </div>
        <div className="trends">
          <h3>Tendencias de España</h3>
        </div>
      </aside>
    </div>
  );
}

export default TarjetaMain;
