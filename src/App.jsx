import React from 'react';
import { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import './App.css';
import AppRouter from './router/router.jsx';

import CardPadre from './components/CardPadre/CardPadre.jsx';
import CardPadre2 from './components/CardPadre2/CardPadre2.jsx';
import CarouselComponent from './components/Carrousel/CarouselComponent.jsx';

function App() { 
  const [liked, setLiked] = useState(false);

  return ( 
    <div className="App">
      <div className='Mitad_Izquierda'>
        <CardPadre2
          image="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSumlR5rxs7S5vvj9jFyq7FqX5gq6eOrnVC3Q&s"
          title="Turn Your Devices From Distractions Into Time Savers"
          subtitle="A journey into digital minimalism"
          text="Every January, I usually purge old email, clothes and unwanted knick-knacks to start the year anew. This time, I focused on my digital spaces instead. My virtual Marie Kondo-ing forced me to think about the indispensable apps and features on my devices—and on the flip side, the time thieves that make it hard to leave the couch."
          date="January 30, 2024"
        />
      </div>
       
      <div className="Mitad_Derecha">
        <div className="card1">
          <CardPadre 
            image="https://definicion.com/wp-content/uploads/2022/09/imagen.jpg.webp" 
            title="Card Title" 
            subtitle="Card Subtitle" 
            text="Texto Aqui ." 
            date="15/01/2024"
          /> 
        </div>

        <div className="card2">
          <CarouselComponent /> 
        </div> 

        <div className="card3">
          <CardPadre 
            image="https://definicion.com/wp-content/uploads/2022/09/imagen.jpg.webp" 
            title="Card Title" 
            subtitle="Card Subtitle" 
            text="Texto Aqui ." 
            date="15/01/2024"
          /> 
          <CardPadre 
            image="https://definicion.com/wp-content/uploads/2022/09/imagen.jpg.webp" 
            title="Card Title" 
            subtitle="Card Subtitle" 
            text="Texto Aqui ." 
            date="15/01/2024"
          /> 
          <CardPadre 
            image="https://definicion.com/wp-content/uploads/2022/09/imagen.jpg.webp" 
            title="Card Title" 
            subtitle="Card Subtitle" 
            text="Texto Aqui ." 
            date="15/01/2024"
          /> 
        </div>

        <div className="card4">
          <CardPadre 
            image="https://definicion.com/wp-content/uploads/2022/09/imagen.jpg.webp" 
            title="Card Title" 
            subtitle="Card Subtitle" 
            text="Texto Aqui ." 
            date="15/01/2024"
          /> 
          <CardPadre 
            image="https://definicion.com/wp-content/uploads/2022/09/imagen.jpg.webp" 
            title="Card Title" 
            subtitle="Card Subtitle" 
            text="Texto Aqui ." 
            date="15/01/2024"
          /> 
          <CardPadre 
            image="https://definicion.com/wp-content/uploads/2022/09/imagen.jpg.webp" 
            title="Card Title" 
            subtitle="Card Subtitle" 
            text="Texto Aqui ." 
            date="15/01/2024"
          /> 
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

