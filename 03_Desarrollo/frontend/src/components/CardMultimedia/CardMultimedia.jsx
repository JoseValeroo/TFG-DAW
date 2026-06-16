import { useState } from 'react';
import { Heart, Repeat, SkipBack, PauseCircle, SkipForward, Shuffle } from 'lucide-react';
import './CardMultimedia.css';

const MusicCard = () => {
  const [liked, setLiked] = useState(false);
  const [progress, setProgress] = useState(33);

  return (
    <div className="music-card">
      <div className="music-card-body">
        <div className="grid">
          <div className="image-container">
            <img
              alt="Album cover"
              className="album-cover"
              src="https://nextui.org/images/album-cover.png"
            />
          </div>

          <div className="info-container">
            <div className="header">
              <div className="title-container">
                <h3 className="title">Daily Mix</h3>
                <p className="subtitle">12 Tracks</p>
                <h1 className="main-title">Frontend Radio</h1>
              </div>
              <button
                className="icon-button heart-button"
                onClick={() => setLiked(!liked)}
                aria-label={liked ? 'Quitar me gusta' : 'Me gusta'}
              >
                <Heart className={liked ? 'filled' : ''} fill={liked ? 'currentColor' : 'none'} />
              </button>
            </div>

            <div className="progress-container">
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="slider"
                aria-label="Progreso de reproducción"
              />
              <div className="time-container">
                <p className="current-time">1:23</p>
                <p className="total-time">4:32</p>
              </div>
            </div>

            <div className="controls-container">
              <button className="icon-button" aria-label="Repetir"><Repeat /></button>
              <button className="icon-button" aria-label="Anterior"><SkipBack /></button>
              <button className="icon-button" aria-label="Pausa"><PauseCircle size={54} /></button>
              <button className="icon-button" aria-label="Siguiente"><SkipForward /></button>
              <button className="icon-button" aria-label="Aleatorio"><Shuffle /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicCard;
