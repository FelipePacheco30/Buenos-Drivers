import React from 'react';
import './styles.css';

export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <header>
          <h3>{title}</h3>
          <button onClick={onClose}>✕</button>
        </header>
        <div className="modal-content">{children}</div>
      </div>
    </div>
  );
}
