import React from 'react';
import { Link } from 'react-router-dom';
import './BotonComponent.css'; // Import the CSS file

const BotonComponent = ({ label, onClick, to }) => {
  return (
    <Link to={to}>
      <button onClick={onClick} className="custom-button">
        {label}
      </button>
    </Link>
  );
};

export default BotonComponent;