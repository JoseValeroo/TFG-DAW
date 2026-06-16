import { useState } from 'react';
import './App.css';
import CardPadre from './components/CardPadre/CardPadre.jsx';
import CardPadre2 from './components/CardPadre2/CardPadre2.jsx';
import CarouselComponent from './components/Carrousel/CarouselComponent.jsx';
import news from './assets/Image/news.png';
import comunidades from './assets/Image/comunidaes.jpg';

const PLACEHOLDER = 'https://definicion.com/wp-content/uploads/2022/09/imagen.jpg.webp';

// Artículo destacado de la columna izquierda.
const featured = {
  image:
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSumlR5rxs7S5vvj9jFyq7FqX5gq6eOrnVC3Q&s',
  title: 'Turn Your Devices From Distractions Into Time Savers',
  subtitle: 'A journey into digital minimalism',
  text: 'Every January, I usually purge old email, clothes and unwanted knick-knacks to start the year anew. This time, I focused on my digital spaces instead. My virtual Marie Kondo-ing forced me to think about the indispensable apps and features on my devices—and on the flip side, the time thieves that make it hard to leave the couch.',
  date: 'January 30, 2024',
};

// Tarjetas del feed, agrupadas por bloque del grid.
const topCard = { id: 'card1', image: news, title: 'Card Title', subtitle: 'Card Subtitle', text: 'Texto Aqui .', date: '15/01/2024' };

const column3 = [
  { id: 'card3-1', image: comunidades, title: 'Card Title', subtitle: 'Card Subtitle', text: 'Texto Aqui .', date: '15/01/2024' },
  { id: 'card3-2', image: PLACEHOLDER, title: 'Card Title', subtitle: 'Card Subtitle', text: 'Texto Aqui .', date: '15/01/2024' },
  { id: 'card3-3', image: PLACEHOLDER, title: 'Card Title', subtitle: 'Card Subtitle', text: 'Texto Aqui .', date: '15/01/2024' },
];

const column4 = [
  { id: 'card4-1', image: PLACEHOLDER, title: 'Card Title', subtitle: 'Card Subtitle', text: 'Texto Aqui .', date: '15/01/2024' },
  { id: 'card4-2', image: PLACEHOLDER, title: 'Card Title', subtitle: 'Card Subtitle', text: 'Texto Aqui .', date: '15/01/2024' },
  { id: 'card4-3', image: PLACEHOLDER, title: 'Card Title', subtitle: 'Card Subtitle', text: 'Texto Aqui .', date: '15/01/2024' },
  { id: 'card4-4', image: PLACEHOLDER, title: 'Card Title', subtitle: 'Card Subtitle', text: 'Texto Aqui .', date: '15/01/2024' },
];

// Índice plano para resolver la tarjeta expandida por id.
const allCards = [topCard, ...column3, ...column4];

function App() {
  const [expandedCardId, setExpandedCardId] = useState(null);

  const expandedCard = allCards.find((card) => card.id === expandedCardId);

  return (
    <div className="App">
      {!expandedCardId ? (
        <>
          <div className="Mitad_Izquierda">
            <CardPadre2 {...featured} />
          </div>

          <div className="Mitad_Derecha">
            <div className="card1">
              <CardPadre onClick={() => setExpandedCardId(topCard.id)} {...topCard} />
            </div>
            <div className="card2">
              <CarouselComponent />
            </div>
            <div className="card3">
              {column3.map((card) => (
                <CardPadre key={card.id} onClick={() => setExpandedCardId(card.id)} {...card} />
              ))}
            </div>
            <div className="card4">
              {column4.map((card) => (
                <CardPadre key={card.id} onClick={() => setExpandedCardId(card.id)} {...card} />
              ))}
            </div>
          </div>
        </>
      ) : (
        // Vista de tarjeta expandida: clic en cualquier parte la cierra.
        <div className="expanded-card" onClick={() => setExpandedCardId(null)}>
          {expandedCard && <CardPadre {...expandedCard} />}
        </div>
      )}
    </div>
  );
}

export default App;
