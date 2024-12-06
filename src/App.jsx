import React from 'react';
//hooks de gestion de usuarios
import { useState } from 'react';
//hooks de enrutamientos y redirecciones
import { Routes, Route , Link } from 'react-router-dom'
//Componentes y css
import './App.css';
import AppRouter from './router/router.jsx';
import CardPadre from './components/CardPadre/CardPadre.jsx';
import BotonComponent from './components/boton/BotonComponent.jsx';
import MicroPerfil from './components/MicroPerfil/MicroPerfil.jsx';

function App() { 

  const [liked, setLiked] = React.useState(false);
  
  return ( 
  <div className="App">
    <div className="Mitad_Izquierda">
      <CardPadre 
        image="https://media.istockphoto.com/id/523035593/es/foto/ferris-wheel-sobre-fondo-blanco.jpg?s=612x612&w=0&k=20&c=H5B6T68zN8vECEYjElz_kkERu9vWudHyqUGyTxFTyxI=" 
        title="Card Title" 
        subtitle="Card Subtitle" 
        text="Texto Aqui ." 
        date="15/01/2024"
      /> 
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
      <BotonComponent label="Login" to="/login"/>
      <BotonComponent label="Register" to="/register"/>
      <BotonComponent label="Perfil" to="/profilePage"/>
    </div>
  </div>
  ); 
} 
export default App;
