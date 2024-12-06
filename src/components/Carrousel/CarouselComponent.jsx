import React from 'react';
import { Carousel } from 'antd';

// Estilos para el contenido dentro de cada slide
const contentStyle = {
  height: '160px',
  color: '#fff',
  lineHeight: '160px',
  textAlign: 'center',
  background: '#364d79',
};

const CarouselComponent = () => (
  <>
    <Carousel arrows dotPosition="left" infinite={false}>
      {/* Primer slide con imagen y texto */}
      <div>
        <img
          src="https://via.placeholder.com/800x300/FF5733/FFFFFF?text=Slide+1"
          alt="Slide 1"
          style={{ width: '100%', height: '160px', objectFit: 'cover' }}
        />
        <div style={contentStyle}>
          <h3>Imagen 1</h3>
          <p>Este es el primer slide con una imagen.</p>
        </div>
      </div>

      {/* Segundo slide con imagen y texto */}
      <div>
        <img
          src="https://via.placeholder.com/800x300/33C4FF/FFFFFF?text=Slide+2"
          alt="Slide 2"
          style={{ width: '100%', height: '160px', objectFit: 'cover' }}
        />
        <div style={contentStyle}>
          <h3>Imagen 2</h3>
          <p>Este es el segundo slide con una imagen.</p>
        </div>
      </div>

      {/* Tercer slide con imagen y texto */}
      <div>
        <img
          src="https://via.placeholder.com/800x300/75FF33/FFFFFF?text=Slide+3"
          alt="Slide 3"
          style={{ width: '100%', height: '160px', objectFit: 'cover' }}
        />
        <div style={contentStyle}>
          <h3>Imagen 3</h3>
          <p>Este es el tercer slide con una imagen.</p>
        </div>
      </div>

      {/* Cuarto slide con imagen y texto */}
      <div>
        <img
          src="https://via.placeholder.com/800x300/9C33FF/FFFFFF?text=Slide+4"
          alt="Slide 4"
          style={{ width: '100%', height: '160px', objectFit: 'cover' }}
        />
        <div style={contentStyle}>
          <h3>Imagen 4</h3>
          <p>Este es el cuarto slide con una imagen.</p>
        </div>
      </div>
    </Carousel>
  </>
);

export default CarouselComponent;
