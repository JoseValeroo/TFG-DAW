import React from 'react';


const BotonComponent = ({ label, onClick }) => {
  return <button onClick={onClick}>{label}</button>;
};

export default BotonComponent;
