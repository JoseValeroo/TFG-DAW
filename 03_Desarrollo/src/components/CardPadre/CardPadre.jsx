import './CardPadre.css';

const CardPadre = ({ onClick, image, title, subtitle, text, date }) => {
  return (
    <div className="center" onClick={onClick}>
      <div className="article-card">
        <div className="content">
          <p className="date">{date}</p>
          <p className="title">{title}</p>
          <p className="subtitle">{subtitle}</p>
          <p className="text">{text}</p>
        </div>
       <img src={image} alt="article-cover"/>
      </div>
    </div>
  );
};

export default CardPadre;
