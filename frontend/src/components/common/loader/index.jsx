import React from 'react';
import './styles.css';

export default function Loader({ text = 'Carregando...' }) {
  return (
    <div className="loader-container">
      <div className="spinner" />
      <span>{text}</span>
    </div>
  );
}
