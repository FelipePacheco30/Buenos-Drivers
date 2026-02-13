import React from "react";
import "./styles.css";


const MOCK_ACCEPTED_24H = 3;
const MOCK_REQUESTS = 12;

export default function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-hero">
        <div className="hero-stripes" />
        <div className="hero-sun" aria-hidden="true" />

        <h1 className="admin-dashboard-title">Painel do administrador</h1>
      </div>

      <div className="admin-dashboard-cards">
        <div className="admin-dashboard-card">
          <div className="admin-dashboard-card-icon" aria-hidden="true">
            ✓
          </div>
          <span className="admin-dashboard-card-label">
            Motoristas aceitos (últimas 24h)
          </span>
          <strong className="admin-dashboard-card-value">{MOCK_ACCEPTED_24H}</strong>
          <div className="badge">Hoje</div>
        </div>

        <div className="admin-dashboard-card">
          <div className="admin-dashboard-card-icon" aria-hidden="true">
            +
          </div>
          <span className="admin-dashboard-card-label">
            Solicitações para motorista
          </span>
          <strong className="admin-dashboard-card-value">{MOCK_REQUESTS}</strong>
          <div className="badge">Total</div>
        </div>
      </div>
    </div>
  );
}
