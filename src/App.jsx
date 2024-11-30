import React from 'react';
//hooks de gestion de usuarios
import { useState } from 'react';
//hooks de enrutamientos y redirecciones
import { Routes, Route , Link } from 'react-router-dom'
//Componentes y css
import './App.css';
import AppRouter from './router/router.jsx';
import CardPadre from './components/CardPadre/CardPadre.jsx';


function App() { 

<<<<<<< HEAD
  const [liked, setLiked] = React.useState(false);
  
  return ( 
  <div className="App">
    <div className="Mitad_Izquierda">
      <CardPadre 
        image="https://definicion.com/wp-content/uploads/2022/09/imagen.jpg.webp" 
        title="Card Title" 
        subtitle="Card Subtitle" 
        text="Texto Aqui ." 
        date="15/01/2024"
      /> 
=======
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
          <button className='post-button-pequeño'>Postear</button>
        </div>
        <div className="posts">
          {/* Post Simulados */}
          <div className="post">
            <a href="profile">
              <img src='/src/assets/Image/elomusk.jpg' alt="User" className="avatar" />
            </a>
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
          <h3>Oferta para premiun!</h3>
          <p>Obtén hasta un 50% de descuento en X Premium</p>
          <button className='button-black-small'>Suscribirse</button>
        </div>
        <div className="who-to-follow">
          <h3>A quién seguir</h3>
        </div>
        <div className="trends">
          <h3>Tendencias de España</h3>
        </div>
      </aside>
>>>>>>> origin/login-register
    </div>

    <div className="Mitad_Derecha">
      <div className="card">
        <CardPadre 
          image="https://definicion.com/wp-content/uploads/2022/09/imagen.jpg.webp" 
          title="Card Title" 
          subtitle="Card Subtitle" 
          text="Texto Aqui ." 
          date="15/01/2024"
        /> 
      </div> 
      <div className="card">
        <CardPadre 
          image="https://definicion.com/wp-content/uploads/2022/09/imagen.jpg.webp" 
          title="Card Title" 
          subtitle="Card Subtitle" 
          text="Texto Aqui ." 
          date="15/01/2024"
        /> 
      </div> 
      <div className="card">
        <CardPadre 
          image="https://definicion.com/wp-content/uploads/2022/09/imagen.jpg.webp" 
          title="Card Title" 
          subtitle="Card Subtitle" 
          text="Texto Aqui ." 
          date="15/01/2024"
        /> 
      </div> 
      <div className="card">
        <CardPadre 
          image="https://definicion.com/wp-content/uploads/2022/09/imagen.jpg.webp" 
          title="Card Title" 
          subtitle="Card Subtitle" 
          text="Texto Aqui ." 
          date="15/01/2024"
        /> 
      </div> 
     
    </div>
  </div>
  ); 
} 
export default App;
