import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import DriverService from "../../../services/driver.service";
import { getToken } from "../../../services/api";
import buenosAiresImage from "../../../assets/images/buenosAires.png";
import "./styles.css";

function getDocumentStatusColor(status) {
  if (status === "EXPIRED") return "danger";
  if (status === "EXPIRING") return "warning";
  return "success";
}

export default function DriverAccount() {
  const { user, logout } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [uploadingId, setUploadingId] = useState(null);

  // mock permitido para número de viagens e tempo de conta (reputação vem real)
  const totalTrips = user?.driver?.total_trips ?? 32;
  const accountAge = "2 anos e 3 meses";

  useEffect(() => {
    async function load() {
      // documentos só são carregados para motoristas
      if (!user || user.role !== "DRIVER") {
        setLoadingDocs(false);
        return;
      }

      try {
        const token = getToken();
        const res = await fetch("http://localhost:3333/documents", {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        const data = await res.json();
        if (res.ok) {
          setDocuments(data);
        } else {
          // se a API ainda não estiver preparada (ex: 403), apenas segue sem documentos
          setDocuments([]);
        }
      } catch {
        setDocuments([]);
      } finally {
        setLoadingDocs(false);
      }
    }
    load();
  }, [user]);

  if (!user) {
    return null; // poderia exibir loader global
  }

  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("") || "?";

  const reputation =
    typeof user.reputation_score === "number"
      ? user.reputation_score.toFixed(1)
      : "-";

  async function handleUpload(doc) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/pdf";
    input.onchange = async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        setUploadingId(doc.id);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", doc.type);

        // endpoint real de upload de documento
        await DriverService.uploadDocument(formData);

        // recarrega lista
        const token = getToken();
        const res = await fetch("http://localhost:3333/documents", {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        const data = await res.json();
        if (res.ok) {
          setDocuments(data);
        }
      } catch (err) {
        console.error("Erro ao enviar documento", err);
      } finally {
        setUploadingId(null);
      }
    };

    input.click();
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

                const canUpload =
                  doc.status === "EXPIRING" || doc.status === "EXPIRED";

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
                        <strong className="document-name">{doc.type}</strong>
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

                    <button
                      className="document-upload-button"
                      onClick={() => handleUpload(doc)}
                      disabled={!canUpload || uploadingId === doc.id}
                    >
                      {uploadingId === doc.id
                        ? "Enviando..."
                        : "Enviar novo documento"}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      <button className="logout-button" onClick={logout}>
        Sair da conta
      </button>
    </div>
  );
}
