import React from 'react';
import './CardMultimedia.css';


import HeartIcon from '../icons/HeartIcon';


const MusicCard = () => {
  const [liked, setLiked] = React.useState(false);

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
              <button className="icon-button heart-button" onClick={() => setLiked(!liked)}>
                <HeartIcon className={liked ? "filled" : ""} />
              </button>
            </div>

            <div className="progress-container">
              <input type="range" min="0" max="100" value="33" className="slider" />
              <div className="time-container">
                <p className="current-time">1:23</p>
                <p className="total-time">4:32</p>
              </div>
            </div>

            <div className="controls-container">
              <button className="icon-button">
                <RepeatOneIcon />
              </button>
              <button className="icon-button">
                <PreviousIcon />
              </button>
              <button className="icon-button">
                <PauseCircleIcon size={54} />
              </button>
              <button className="icon-button">
                <NextIcon />
              </button>
              <button className="icon-button">
                <ShuffleIcon />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicCard;
