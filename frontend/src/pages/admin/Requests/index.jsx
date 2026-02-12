import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiFilter } from "react-icons/fi";
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
    vehicles: [
      { id: "v-1", kind: "CAR", brand: "Toyota", model: "Corolla", year: 2019, color: "Prata", plate: "LU123AB" },
    ],
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
    vehicles: [
      { id: "v-2", kind: "MOTO", brand: "Honda", model: "CG 160", year: 2021, color: "Preto", plate: "MA456CD" },
      { id: "v-3", kind: "CAR", brand: "Chevrolet", model: "Onix", year: 2020, color: "Branco", plate: "MA789EF" },
    ],
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
    vehicles: [
      { id: "v-4", kind: "CAR", brand: "Renault", model: "Kwid", year: 2022, color: "Vermelho", plate: "SO321GH" },
    ],
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

export default function AdminRequests() {
  const navigate = useNavigate();
  const { requestId } = useParams();

  const filterRef = useRef(null);
  const [query, setQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilters, setStatusFilters] = useState({
    pending: true,
    validated: true,
  });

  // validação local (não persiste)
  const [validatedByRequest, setValidatedByRequest] = useState({});

  useEffect(() => {
    if (!filterOpen) return;
    function onDocClick(e) {
      const el = filterRef.current;
      if (!el) return;
      if (el.contains(e.target)) return;
      setFilterOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("touchstart", onDocClick);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("touchstart", onDocClick);
    };
  }, [filterOpen]);

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

    // filtros por checkbox (whatsapp-like)
    list = list.filter((r) => {
      const validated = validatedByRequest[r.id] || {};
      const docsOk = r.documents.every((d) => !!validated[`doc:${d.type}`]);
      const vehicles = Array.isArray(r.vehicles) ? r.vehicles : [];
      const vehiclesOk = vehicles.length > 0 ? vehicles.every((v) => !!validated[`veh:${v.id}`]) : false;
      const done = docsOk && vehiclesOk;
      if (done) return !!statusFilters.validated;
      return !!statusFilters.pending;
    });

    const sorted = [...list].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return sorted;
  }, [query, validatedByRequest, statusFilters]);

  const selected = useMemo(() => {
    if (!requestId) return null;
    return MOCK_REQUESTS.find((r) => r.id === requestId) || null;
  }, [requestId]);

  if (requestId) {
    const validated = validatedByRequest[requestId] || {};
    const allVehiclesValidated = selected
      ? (Array.isArray(selected.vehicles) ? selected.vehicles : []).every((v) => !!validated[`veh:${v.id}`])
      : false;
    const allDocsValidated = selected
      ? selected.documents.every((d) => !!validated[`doc:${d.type}`])
      : false;
    const allOk = allDocsValidated && allVehiclesValidated;

    return (
      <div className="admin-requests">
        <div className="admin-requests-topbar">
          <button
            className="admin-requests-back"
            onClick={() => navigate("/admin/requests")}
            aria-label="Voltar"
            title="Voltar"
          >
            <FiArrowLeft />
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
                  const ok = !!validated[`doc:${doc.type}`];
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
                                [requestId]: {
                                  ...(prev[requestId] || {}),
                                  [`doc:${doc.type}`]: true,
                                },
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

              <h2 style={{ marginTop: 16 }}>Veículos</h2>
              <div className="admin-request-docs">
                {(selected.vehicles || []).map((v) => {
                  const ok = !!validated[`veh:${v.id}`];
                  return (
                    <div key={v.id} className="admin-request-doc">
                      <div className="admin-request-doc-top">
                        <div className="admin-request-doc-title">
                          <strong>
                            {v.kind === "MOTO" ? "Moto" : "Carro"} • {v.brand} {v.model}
                          </strong>
                          {ok && <span className="doc-check">✓</span>}
                        </div>
                        <div className="admin-request-doc-actions">
                          <button
                            className="btn-secondary"
                            onClick={() => alert("Visualização do veículo será implementada depois.")}
                          >
                            Ver
                          </button>
                          <button
                            className={`btn-primary ${ok ? "ok" : ""}`}
                            onClick={() =>
                              setValidatedByRequest((prev) => ({
                                ...prev,
                                [requestId]: {
                                  ...(prev[requestId] || {}),
                                  [`veh:${v.id}`]: true,
                                },
                              }))
                            }
                          >
                            Validar
                          </button>
                        </div>
                      </div>

                      <div className="admin-request-doc-dates">
                        <span>
                          Placa: <strong>{v.plate}</strong>
                        </span>
                        <span>
                          {v.color} • <strong>{v.year}</strong>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                className="admin-request-accept"
                disabled={!allOk}
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
        <div className="requests-topbar">
          <input
            className="admin-requests-search"
            placeholder="Buscar por nome ou email…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <div className="filter-wrap">
            <button
              className="filter-btn"
              aria-label="Filtros"
              onClick={() => setFilterOpen((v) => !v)}
            >
              <FiFilter />
            </button>

            {filterOpen && (
              <div className="filter-dropdown" role="menu" ref={filterRef}>
                <label className="filter-item">
                  <input
                    type="checkbox"
                    checked={!!statusFilters.pending}
                    onChange={(e) =>
                      setStatusFilters((p) => ({ ...p, pending: e.target.checked }))
                    }
                  />
                  Pendentes
                </label>
                <label className="filter-item">
                  <input
                    type="checkbox"
                    checked={!!statusFilters.validated}
                    onChange={(e) =>
                      setStatusFilters((p) => ({
                        ...p,
                        validated: e.target.checked,
                      }))
                    }
                  />
                  Validadas
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="admin-requests-list">
        {requests.map((r) => {
          const validated = validatedByRequest[r.id] || {};
          const done = r.documents.every((d) => !!validated[d.type]);
          const pendingCount = r.documents.filter((d) => !validated[d.type]).length;

          return (
            <button
              key={r.id}
              className="admin-request-row"
              onClick={() => navigate(`/admin/requests/${r.id}`)}
            >
              <div className="admin-request-row-avatar">
                {r.user.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </div>

              <div className="admin-request-row-main">
                <div className="admin-request-row-top">
                  <div className="admin-request-row-name">
                    <strong>{r.user.name}</strong>
                    <span className={`state-tag ${done ? "success" : "warning"}`}>
                      {done ? "Validada" : `${pendingCount} pend.`}
                    </span>
                  </div>
                </div>
                <div className="admin-request-row-bottom">{r.user.email}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

