import { ThumbsUp } from 'lucide-react';
import './CardPadre2.css';

const CardPadre2 = ({ image, title, subtitle, text, date }) => {
  
  return (
    <div className="card" style={{ backgroundImage: `url(${image})` }}>
      {/* Fondo de la imagen (cubre todo el div) */}
      <div className="card-background" aria-hidden="true" />
      
      {/* Contenido superpuesto */}
      <div className="card-content">
        <div className="card-header">
          <div className="date">{date}</div>
          <h2 className="title">{title}</h2>
          <h3 className="subtitle">{subtitle}</h3>
        </div>
        
        <div className="card-body">
          <p className="text">{text}</p>
          <div className="like">
            <ThumbsUp className="thumbs-icon" />
            <span>38</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardPadre2;
