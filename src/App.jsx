import React, { useState } from 'react';
import './App.css';
import CardPadre from './components/CardPadre/CardPadre.jsx';
import CardPadre2 from './components/CardPadre2/CardPadre2.jsx';
import CarouselComponent from './components/Carrousel/CarouselComponent.jsx';

function App() { 
  const [expandedCard, setExpandedCard] = useState(null);

  const handleCardClick = (cardId) => { 
    console.log("Card clicked!");
    setExpandedCard(cardId); 
  };

  const handleCloseClick = () => {
    setExpandedCard(null);
  };

  return ( 
    <div className="App">
      {!expandedCard ? (
        <>
          <div className="Mitad_Izquierda">
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
                onClick={() => handleCardClick('card1')} 
                image="src/assets/Image/news.png" 
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
                onClick={() => handleCardClick('card3-1')} 
                image="src/assets/Image/comunidaes.jpg" 
                title="Card Title" 
                subtitle="Card Subtitle" 
                text="Texto Aqui ." 
                date="15/01/2024"
              /> 
              <CardPadre 
                onClick={() => handleCardClick('card3-2')}
                image="https://definicion.com/wp-content/uploads/2022/09/imagen.jpg.webp" 
                title="Card Title" 
                subtitle="Card Subtitle" 
                text="Texto Aqui ." 
                date="15/01/2024"
              /> 
              <CardPadre 
                onClick={() => handleCardClick('card3-3')}
                image="https://definicion.com/wp-content/uploads/2022/09/imagen.jpg.webp" 
                title="Card Title" 
                subtitle="Card Subtitle" 
                text="Texto Aqui ." 
                date="15/01/2024"
              /> 
            </div>
            <div className="card4">
              <CardPadre 
                onClick={() => handleCardClick('card4-1')}
                image="https://definicion.com/wp-content/uploads/2022/09/imagen.jpg.webp" 
                title="Card Title" 
                subtitle="Card Subtitle" 
                text="Texto Aqui ." 
                date="15/01/2024"
              /> 
              <CardPadre 
                onClick={() => handleCardClick('card4-2')}
                image="https://definicion.com/wp-content/uploads/2022/09/imagen.jpg.webp" 
                title="Card Title" 
                subtitle="Card Subtitle" 
                text="Texto Aqui ." 
                date="15/01/2024"
              /> 
              <CardPadre 
                onClick={() => handleCardClick('card4-3')}
                image="https://definicion.com/wp-content/uploads/2022/09/imagen.jpg.webp" 
                title="Card Title" 
                subtitle="Card Subtitle" 
                text="Texto Aqui ." 
                date="15/01/2024"
              /> 
              <CardPadre 
                onClick={() => handleCardClick('card4-4')}
                image="https://definicion.com/wp-content/uploads/2022/09/imagen.jpg.webp" 
                title="Card Title" 
                subtitle="Card Subtitle" 
                text="Texto Aqui ." 
                date="15/01/2024"
              /> 
            </div> 
          </div>
        </>
      ) : ( //El componente que se renderiza al dar click en cualquier tarjeta...
        <div className="expanded-card" onClick={handleCloseClick}>
          {expandedCard === 'card1' && (
            <CardPadre 
              image="src/assets/Image/news.png" 
              title="Card Title" 
              subtitle="Card Subtitle" 
              text="Texto Aqui ." 
              date="15/01/2024" 
            />
          )}
          {expandedCard === 'card3-1' && (
            <CardPadre 
              image="src/assets/Image/comunidaes.jpg" 
              title="Card Title" 
              subtitle="Card Subtitle" 
              text="Texto Aqui ." 
              date="15/01/2024" 
            />
          )}
          {expandedCard === 'card3-2' && (
            <CardPadre 
              image="https://definicion.com/wp-content/uploads/2022/09/imagen.jpg.webp" 
              title="Card Title" 
              subtitle="Card Subtitle" 
              text="Texto Aqui ." 
              date="15/01/2024" 
            />
          )}
          {expandedCard === 'card3-3' && (
            <CardPadre 
              image="https://definicion.com/wp-content/uploads/2022/09/imagen.jpg.webp" 
              title="Card Title" 
              subtitle="Card Subtitle" 
              text="Texto Aqui ." 
              date="15/01/2024" 
            />
          )}
          {expandedCard === 'card4-1' && (
            <CardPadre 
              image="https://definicion.com/wp-content/uploads/2022/09/imagen.jpg.webp" 
              title="Card Title" 
              subtitle="Card Subtitle" 
              text="Texto Aqui ." 
              date="15/01/2024" 
            />
          )}
          {expandedCard === 'card4-2' && (
            <CardPadre 
              image="https://definicion.com/wp-content/uploads/2022/09/imagen.jpg.webp" 
              title="Card Title" 
              subtitle="Card Subtitle" 
              text="Texto Aqui ." 
              date="15/01/2024" 
            />
          )}
          {expandedCard === 'card4-3' && (
            <CardPadre 
              image="https://definicion.com/wp-content/uploads/2022/09/imagen.jpg.webp" 
              title="Card Title" 
              subtitle="Card Subtitle" 
              text="Texto Aqui ." 
              date="15/01/2024" 
            />
          )}
          {expandedCard === 'card4-4' && (
            <CardPadre 
              image="https://definicion.com/wp-content/uploads/2022/09/imagen.jpg.webp" 
              title="Card Title" 
              subtitle="Card Subtitle" 
              text="Texto Aqui ." 
              date="15/01/2024" 
            />
          )}
        </div>
      )}
    </div>
  ); 
} 

export default App;
