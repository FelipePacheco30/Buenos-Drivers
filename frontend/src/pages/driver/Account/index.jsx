import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { getToken } from "../../../services/api";
import buenosAiresImage from "../../../assets/images/buenosAires.png";
import { useNavigate } from "react-router-dom";
import useWebSocket from "../../../hooks/useWebSocket";
import "./styles.css";

function getDocumentStatusColor(status) {
  if (status === "EXPIRED") return "danger";
  if (status === "EXPIRING") return "warning";
  return "success";
}

export default function DriverAccount() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { events } = useWebSocket();
  const processedEventsRef = useRef(0);
  const reloadTimerRef = useRef(null);
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [negativeReviews, setNegativeReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // mock permitido para número de viagens e tempo de conta (reputação vem real)
  const totalTrips = user?.driver?.total_trips ?? 32;
  const accountAge = "2 anos e 3 meses";

  async function loadDocs() {
    if (!user || user.role !== "DRIVER") {
      setLoadingDocs(false);
      return;
    }

    try {
      setLoadingDocs(true);
      const token = getToken();
      const res = await fetch("http://localhost:3333/documents", {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      const data = await res.json();
      if (res.ok) setDocuments(data);
      else setDocuments([]);
    } catch {
      setDocuments([]);
    } finally {
      setLoadingDocs(false);
    }
  }

  async function loadVehicles() {
    if (!user || user.role !== "DRIVER") {
      setLoadingVehicles(false);
      return;
    }

    try {
      setLoadingVehicles(true);
      const token = getToken();
      const res = await fetch("http://localhost:3333/vehicles", {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) setVehicles(data);
      else setVehicles([]);
    } catch {
      setVehicles([]);
    } finally {
      setLoadingVehicles(false);
    }
  }

  async function loadNegativeReviews() {
    if (!user || user.role !== "DRIVER") {
      setLoadingReviews(false);
      return;
    }
    try {
      setLoadingReviews(true);
      const token = getToken();
      const res = await fetch("http://localhost:3333/driver/reviews/negative", {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      const data = await res.json().catch(() => []);
      setNegativeReviews(res.ok && Array.isArray(data) ? data : []);
    } catch {
      setNegativeReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  }

  useEffect(() => {
    loadDocs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    loadVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    loadNegativeReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (!events || events.length === 0) return;
    let shouldReload = false;
    for (let i = processedEventsRef.current; i < events.length; i++) {
      const ev = events[i];
      if (!ev) continue;
      if (ev.type === "RENEWAL_APPROVED") {
        shouldReload = true;
      }
    }
    processedEventsRef.current = events.length;
    if (shouldReload) {
      loadDocs();
      loadVehicles();
      loadNegativeReviews();
      if (reloadTimerRef.current) clearTimeout(reloadTimerRef.current);
      // fallback: refaz mais uma vez para ficar robusto
      reloadTimerRef.current = setTimeout(() => {
        loadDocs();
        loadVehicles();
        loadNegativeReviews();
      }, 900);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events]);

  useEffect(() => {
    return () => {
      if (reloadTimerRef.current) clearTimeout(reloadTimerRef.current);
    };
  }, []);

  if (!user) {
    return null; // poderia exibir loader global
  }

  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("") || "?";

  const repNum =
    user?.reputation_score === null || user?.reputation_score === undefined
      ? NaN
      : Number.parseFloat(String(user.reputation_score));
  const reputation = Number.isFinite(repNum) ? repNum.toFixed(1) : "-";

  function goToSendDocs() {
    navigate("/driver/renewals");
  }

  return (
    <div className="driver-account">
      {/* BANNER */}
      <div className="account-banner">
        <img src={buenosAiresImage} alt="Buenos Aires" />
        <div className="account-banner-overlay" />

        <div className="account-banner-content">
          <div className="account-avatar">
            <span>{initials}</span>
          </div>
          <h1 className="account-name">{user.name}</h1>
        </div>
      </div>

      {/* BLOCO CENTRAL (MÉTRICAS + DOCUMENTOS) */}
      <div className="account-main">
        <div className="account-main-inner">
          {/* MÉTRICAS RÁPIDAS */}
          <section className="account-metrics">
            <div className="metric-card">
              <span className="metric-label">Reputação</span>
              <strong className="metric-value">{reputation} ★</strong>
            </div>

            <div className="metric-card">
              <span className="metric-label">Viagens</span>
              <strong className="metric-value">{totalTrips}</strong>
            </div>

            <div className="metric-card">
              <span className="metric-label">Tempo de conta</span>
              <strong className="metric-value">{accountAge}</strong>
            </div>
          </section>

          {/* DOCUMENTOS */}
          <section className="account-documents">
            <h2>Documentos</h2>

            {loadingDocs && (
              <p className="documents-loading">Carregando...</p>
            )}

            {!loadingDocs && documents.length === 0 && (
              <p className="documents-empty">
                Nenhum documento cadastrado ainda.
              </p>
            )}

            <div className="documents-list">
              {documents.map((doc) => {
                const statusClass = getDocumentStatusColor(doc.status);

                const createdAt = doc.created_at
                  ? new Date(doc.created_at).toLocaleDateString()
                  : "-";

                const expiresAt = doc.expires_at
                  ? new Date(doc.expires_at).toLocaleDateString()
                  : "-";

                return (
                  <div key={doc.id} className={`document-card ${statusClass}`}>
                    <div className="document-main">
                      <div className="document-icon">📄</div>
                      <div>
                        <strong className="document-name">
                          {doc.type === "CRLV"
                            ? `CRLV${doc.vehicle_plate ? ` (${doc.vehicle_plate})` : ""}`
                            : doc.type === "CRIMINAL_RECORD"
                              ? "Histórico criminal"
                              : doc.type}
                        </strong>
                        <span
                          className={`document-status-pill ${statusClass}`}
                        >
                          {doc.status === "VALID" && "Em dia"}
                          {doc.status === "EXPIRING" && "Próximo do vencimento"}
                          {doc.status === "EXPIRED" && "Vencido"}
                        </span>
                      </div>
                    </div>

                    <div className="document-dates">
                      <span>
                        Inserido em: <strong>{createdAt}</strong>
                      </span>
                      <span>
                        Vencimento: <strong>{expiresAt}</strong>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* MEUS VEÍCULOS */}
          <section className="account-vehicles">
            <h2>Meus veículos</h2>

            {loadingVehicles && (
              <p className="vehicles-loading">Carregando...</p>
            )}

            {!loadingVehicles && vehicles.length === 0 && (
              <p className="vehicles-empty">Nenhum veículo cadastrado ainda.</p>
            )}

            <div className="vehicles-list">
              {vehicles.map((v) => {
                const kind = String(v.kind || "").toUpperCase();
                const modelGuess = String(v.model || "").toLowerCase();
                const isMoto =
                  kind === "MOTO" ||
                  modelGuess.includes("moto") ||
                  modelGuess.includes("cg") ||
                  modelGuess.includes("cb") ||
                  modelGuess.includes("biz");
                const icon = isMoto ? "🏍" : "🚗";
                return (
                  <div key={v.id} className="vehicle-card">
                    <div className="vehicle-main">
                      <div className="vehicle-icon" aria-hidden="true">
                        {icon}
                      </div>
                      <div className="vehicle-info">
                        <strong className="vehicle-name">
                          {v.model} • {v.color} • {v.year}
                        </strong>
                        <span className="vehicle-plate">{v.plate}</span>
                      </div>
                    </div>

                    <button
                      className="vehicle-remove-button"
                      onClick={() =>
                        alert(
                          "Solicitação de remoção será enviada aos administradores (implementaremos em breve)."
                        )
                      }
                    >
                      Solicitar remoção de veículo
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* AVALIAÇÕES NEGATIVAS */}
          <section className="account-negative-reviews">
            <h2>Avaliações negativas recentes</h2>

            {loadingReviews && (
              <p className="reviews-loading">Carregando...</p>
            )}

            {!loadingReviews && negativeReviews.length === 0 && (
              <p className="reviews-empty">Nenhuma avaliação negativa recente.</p>
            )}

            <div className="reviews-list">
              {negativeReviews.map((r) => (
                <div key={r.id} className="review-card">
                  <strong className="review-reason">{r.reason}</strong>
                  <span className="review-date">
                    {r.created_at ? new Date(r.created_at).toLocaleDateString() : "-"}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="account-actions">
        <button className="logout-button" onClick={logout}>
          Sair da conta
        </button>
        <button className="send-docs-button" onClick={goToSendDocs}>
          Enviar documentos
        </button>
      </div>
    </div>
  );
}
