import { useState,useEffect } from 'react'

import Login from './pages/login/login.jsx'
import './App.css'
//Esta es como el componente padre, el main.jsx llama a esto y renderiza esto
//ahora esto tienes que meterle los componentes o paginas
function App() {
  return (
    <div className="app">
    <aside className="sidebar">
      <nav>
        <ul>
          <li><a href="ElLogo"><span>X</span></a></li>
          <li><a href="Inicio"><span>Inicio</span></a></li>
          <li><a href="Explorar"><span>Explorar</span></a></li>
          <li><a href="Notificaciones"><span>Notificaciones</span></a></li>
          <li><a href="Mensajes"><span>Mensajes</span></a></li>
          <li><a href="Guardados"><span>Guardados</span></a></li>
          <li><a href="Comunidades"><span>Comunidades</span></a></li>
          <li><a href="Premium"><span>Premium</span></a></li>
          <li><a href="Perfil"><span>Perfil</span></a></li>
          <li><a href="Opciones"><span>Más opciones</span></a></li>
        </ul>
      </nav>
      <button className="post-button">Postear</button>
      bu
        <button className="post-button">Postear</button>
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
        <button>Postear</button>
      </div>
      <div className="posts">
        {/* Post Simulados */}
        <div className="post">
          <img src="https://pbs.twimg.com/profile_images/1524819997104775168/kPbL08YN_400x400.jpg" alt="User" className="avatar" />
          <div className="post-content">
            <h3>No estás Registrado...</h3>
            <p>Contenido de tu post de ejemplo, no se si al modificar el contenido de este twit se cambia el contenedor.</p>
          </div>
        </div>
        {/*El resto de post, aqui */}
      </div>
    </main>
    <aside className="right-sidebar">
      <div className="search-bar">
        <input type="text" placeholder="Buscar" />
      </div>
      <div className="premium-offer">
        <h3>Oferta para premiun!</h3>
        <p>Obtén hasta un 50% de descuento en X Premium</p>
        <button>Suscribirse</button>
      </div>
      <div className="who-to-follow">
        <h3>A quién seguir</h3>
        {/* Cuentas para seguir de ejemplo aqui... */}
      </div>
      <div className="trends">
        <h3>Tendencias de España</h3>
        {/* Top tt aqui...*/}
      </div>
    </aside>
  </div>
  )
  button
}
export default App
