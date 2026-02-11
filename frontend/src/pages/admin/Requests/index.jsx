import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./styles.css";

const MOCK_REQUESTS = [
  {
    id: "req-1",
    created_at: "2026-02-10T15:10:00.000Z",
    user: {
      name: "Lucía Fernández",
      email: "lucia.fernandez@email.com",
      city: "Buenos Aires",
    },
    documents: [
      { type: "CNH", issued_at: "2024-01-10", expires_at: "2028-01-10" },
      { type: "CRLV", issued_at: "2025-03-01", expires_at: "2026-03-01" },
      { type: "CRIMINAL_RECORD", issued_at: "2025-08-15", expires_at: "2026-08-15" },
    ],
  },
  {
    id: "req-2",
    created_at: "2026-02-09T20:20:00.000Z",
    user: {
      name: "Matías Gómez",
      email: "matias.gomez@email.com",
      city: "La Plata",
    },
    documents: [
      { type: "CNH", issued_at: "2023-05-12", expires_at: "2027-05-12" },
      { type: "CRLV", issued_at: "2025-02-01", expires_at: "2026-02-14" },
      { type: "CRIMINAL_RECORD", issued_at: "2025-01-01", expires_at: "2026-01-01" },
    ],
  },
  {
    id: "req-3",
    created_at: "2026-02-08T09:35:00.000Z",
    user: {
      name: "Sofía Martínez",
      email: "sofia.martinez@email.com",
      city: "Buenos Aires",
    },
    documents: [
      { type: "CNH", issued_at: "2022-11-20", expires_at: "2026-11-20" },
      { type: "CRLV", issued_at: "2025-04-10", expires_at: "2026-04-10" },
      { type: "CRIMINAL_RECORD", issued_at: "2025-10-10", expires_at: "2026-10-10" },
    ],
  },
];

function formatDate(dateLike) {
  if (!dateLike) return "-";
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString();
}

const FILTERS = [
  { id: "recent", label: "Mais recentes" },
  { id: "pending", label: "Pendentes" },
  { id: "validated", label: "Validadas" },
];

export default function AdminRequests() {
  const navigate = useNavigate();
  const { requestId } = useParams();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("recent");

  // validação local (não persiste)
  const [validatedByRequest, setValidatedByRequest] = useState({});

  const requests = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = MOCK_REQUESTS;

    if (q) {
      list = list.filter((r) => {
        const name = String(r.user?.name || "").toLowerCase();
        const email = String(r.user?.email || "").toLowerCase();
        return name.includes(q) || email.includes(q);
      });
    }

    if (filter === "pending") {
      list = list.filter((r) => {
        const validated = validatedByRequest[r.id] || {};
        return r.documents.some((d) => !validated[d.type]);
      });
    }

    if (filter === "validated") {
      list = list.filter((r) => {
        const validated = validatedByRequest[r.id] || {};
        return r.documents.every((d) => !!validated[d.type]);
      });
    }

    const sorted = [...list].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return sorted;
  }, [filter, query, validatedByRequest]);

  const selected = useMemo(() => {
    if (!requestId) return null;
    return MOCK_REQUESTS.find((r) => r.id === requestId) || null;
  }, [requestId]);

  if (requestId) {
    const validated = validatedByRequest[requestId] || {};
    const allValidated = selected
      ? selected.documents.every((d) => !!validated[d.type])
      : false;

    return (
      <div className="admin-requests">
        <div className="admin-requests-topbar">
          <button className="admin-requests-back" onClick={() => navigate("/admin/requests")}>
            Voltar
          </button>
          <div className="admin-requests-topbar-title">Solicitação</div>
        </div>

        {!selected && (
          <div className="admin-requests-empty">Solicitação não encontrada.</div>
        )}

        {selected && (
          <div className="admin-request-detail">
            <div className="admin-request-header">
              <div className="admin-request-avatar">
                {selected.user.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div className="admin-request-meta">
                <div className="admin-request-name">{selected.user.name}</div>
                <div className="admin-request-sub">
                  <span className="pill pill-blue">{selected.user.email}</span>
                  <span className="pill pill-yellow">{selected.user.city}</span>
                </div>
                <div className="admin-request-created">
                  Enviado em: <strong>{formatDate(selected.created_at)}</strong>
                </div>
              </div>
            </div>

            <div className="admin-request-section">
              <h2>Documentos</h2>
              <div className="admin-request-docs">
                {selected.documents.map((doc) => {
                  const ok = !!validated[doc.type];
                  return (
                    <div key={doc.type} className="admin-request-doc">
                      <div className="admin-request-doc-top">
                        <div className="admin-request-doc-title">
                          <strong>{doc.type}</strong>
                          {ok && <span className="doc-check">✓</span>}
                        </div>
                        <div className="admin-request-doc-actions">
                          <button
                            className="btn-secondary"
                            onClick={() =>
                              alert(
                                "Visualização do arquivo será implementada quando houver upload de PDF/foto."
                              )
                            }
                          >
                            Ver
                          </button>
                          <button
                            className={`btn-primary ${ok ? "ok" : ""}`}
                            onClick={() =>
                              setValidatedByRequest((prev) => ({
                                ...prev,
                                [requestId]: { ...(prev[requestId] || {}), [doc.type]: true },
                              }))
                            }
                          >
                            Validar
                          </button>
                        </div>
                      </div>

                      <div className="admin-request-doc-dates">
                        <span>
                          Emissão: <strong>{formatDate(doc.issued_at)}</strong>
                        </span>
                        <span>
                          Venc.: <strong>{formatDate(doc.expires_at)}</strong>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                className="admin-request-accept"
                disabled={!allValidated}
                onClick={() =>
                  alert("Aceitar motorista (ação será implementada depois).")
                }
              >
                Aceitar motorista
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="admin-requests">
      <div className="admin-requests-header">
        <h1>Solicitações</h1>
        <div className="admin-requests-subtitle">
          Valide documentos para aceitar novos motoristas (mock nesta etapa)
        </div>
      </div>

      <div className="admin-requests-toolbar">
        <input
          className="admin-requests-search"
          placeholder="Buscar por nome ou email…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="admin-requests-filters">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              className={`chip ${filter === f.id ? "active" : ""}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-requests-grid">
        {requests.map((r) => {
          const validated = validatedByRequest[r.id] || {};
          const done = r.documents.every((d) => !!validated[d.type]);
          const pendingCount = r.documents.filter((d) => !validated[d.type]).length;

          return (
            <button
              key={r.id}
              className="admin-request-card"
              onClick={() => navigate(`/admin/requests/${r.id}`)}
            >
              <div className="admin-request-card-top">
                <div className="admin-request-card-avatar">
                  {r.user.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <span className={`pill ${done ? "success" : "warning"}`}>
                  {done ? "Completa" : `${pendingCount} pend.`}
                </span>
              </div>

              <div className="admin-request-card-name">{r.user.name}</div>
              <div className="admin-request-card-email">{r.user.email}</div>
              <div className="admin-request-card-footer">
                <span className="pill pill-yellow">{r.user.city}</span>
                <span className="pill pill-blue">{formatDate(r.created_at)}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

