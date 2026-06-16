import { useState, useEffect, useCallback } from 'react';
import './CarouselComponent.css';

const slides = [
  { id: 1, color: '#FF5733', title: 'Imagen 1', text: 'Este es el primer slide.' },
  { id: 2, color: '#33C4FF', title: 'Imagen 2', text: 'Este es el segundo slide.' },
  { id: 3, color: '#75FF33', title: 'Imagen 3', text: 'Este es el tercer slide.' },
  { id: 4, color: '#9C33FF', title: 'Imagen 4', text: 'Este es el cuarto slide.' },
];

// Carrusel ligero sin dependencias (antes usaba antd Carousel, que arrastraba
// toda la librería al bundle de la home). Auto-avanza y permite navegar.
const CarouselComponent = () => {
  const [index, setIndex] = useState(0);

  const goTo = useCallback((i) => {
    setIndex((i + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="carousel">
      <div
        className="carousel-track"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="carousel-slide"
            style={{ background: slide.color }}
          >
            <h3>{slide.title}</h3>
            <p>{slide.text}</p>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="carousel-arrow prev"
        onClick={() => goTo(index - 1)}
        aria-label="Slide anterior"
      >
        ‹
      </button>
      <button
        type="button"
        className="carousel-arrow next"
        onClick={() => goTo(index + 1)}
        aria-label="Slide siguiente"
      >
        ›
      </button>

      <div className="carousel-dots">
        {slides.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            className={`carousel-dot ${i === index ? 'active' : ''}`}
            onClick={() => goTo(i)}
            aria-label={`Ir al slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default CarouselComponent;
