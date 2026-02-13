import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiFilter } from "react-icons/fi";
import { getToken } from "../../../services/api";
import "./styles.css";

function toNumber(v) {
  const n = typeof v === "number" ? v : Number.parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
}

function statusLabel(status) {
  if (status === "EXPIRED") return "Vencido";
  if (status === "EXPIRING") return "Próximo do venc.";
  return "Em dia";
}

function statusClass(status) {
  if (status === "EXPIRED") return "danger";
  if (status === "EXPIRING") return "warning";
  return "success";
}

function overallLabel(userStatus, docsStatus) {
  if (userStatus === "BANNED") return "Banido";
  if (userStatus === "IRREGULAR") return "Irregular";
  return statusLabel(docsStatus || "VALID");
}

function overallClass(userStatus, docsStatus) {
  if (userStatus === "BANNED") return "danger";
  if (userStatus === "IRREGULAR") return "warning";
  return statusClass(docsStatus || "VALID");
}

function formatDate(dateLike) {
  if (!dateLike) return "-";
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString();
}

export default function AdminDrivers() {
  const navigate = useNavigate();
  const { driverId } = useParams();

  const filterRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilters, setStatusFilters] = useState({
    ACTIVE: true,
    IRREGULAR: true,
    BANNED: true,
  });

  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [negativeReviews, setNegativeReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

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

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const token = getToken();

        const res = await fetch("http://localhost:3333/admin/drivers", {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        const data = await res.json();
        if (res.ok) setItems(Array.isArray(data) ? data : []);
        else setItems([]);
      } finally {
        setLoading(false);
      }
    }

    
    load();
  }, []);

  useEffect(() => {
    async function loadDetail() {
      if (!driverId) {
        setDetail(null);
        setNegativeReviews([]);
        return;
      }

      try {
        setLoadingDetail(true);
        const token = getToken();

        const res = await fetch(`http://localhost:3333/admin/drivers/${driverId}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        const data = await res.json();
        if (res.ok) setDetail(data);
        else setDetail(null);
      } finally {
        setLoadingDetail(false);
      }
    }

    loadDetail();
  }, [driverId]);

  useEffect(() => {
    async function loadNegativeReviews() {
      if (!driverId) return;
      try {
        setLoadingReviews(true);
        const token = getToken();
        const res = await fetch(
          `http://localhost:3333/admin/drivers/${driverId}/reviews/negative`,
          { headers: { Authorization: token ? `Bearer ${token}` : "" } }
        );
        const data = await res.json().catch(() => []);
        setNegativeReviews(res.ok && Array.isArray(data) ? data : []);
      } finally {
        setLoadingReviews(false);
      }
    }
    loadNegativeReviews();
  }, [driverId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = items;

    if (q) {
      list = list.filter((d) => {
        const name = String(d.name || "").toLowerCase();
        const email = String(d.email || "").toLowerCase();
        return name.includes(q) || email.includes(q);
      });
    }

    
    const allowed = statusFilters;
    list = list.filter((d) => {
      const st = d.user_status || "ACTIVE";
      return !!allowed[st];
    });

    
    const sorted = [...list];
    sorted.sort(
      (a, b) =>
        new Date(b.driver_created_at || 0).getTime() -
        new Date(a.driver_created_at || 0).getTime()
    );

    return sorted;
  }, [items, query, statusFilters]);

  if (driverId) {
    return (
      <div className="admin-drivers">
        <div className="admin-drivers-topbar">
          <button
            className="admin-drivers-back"
            onClick={() => navigate("/admin/drivers")}
            aria-label="Voltar"
            title="Voltar"
          >
            <FiArrowLeft />
          </button>
          <div className="admin-drivers-topbar-title">Motorista</div>
        </div>

        {loadingDetail && <div className="admin-drivers-loading">Carregando...</div>}

        {!loadingDetail && !detail && (
          <div className="admin-drivers-empty">Motorista não encontrado.</div>
        )}

        {!loadingDetail && detail && (
          <div className="admin-driver-detail">
            <div className="admin-driver-header">
              <div className="admin-driver-avatar">
                {(detail.name || "?")
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div className="admin-driver-meta">
                <div className="admin-driver-name">{detail.name}</div>
                <div className="admin-driver-sub">
                  <span className="pill pill-blue">{detail.email}</span>
                  <span className={`pill ${overallClass(detail.user_status, detail.documents_overall_status)}`}>
                    {overallLabel(detail.user_status, detail.documents_overall_status)}
                  </span>
                </div>
              </div>
            </div>

            <div className="admin-driver-kpis">
              <div className="kpi">
                <span>Reputação</span>
                <strong>{toNumber(detail.reputation_score).toFixed(1)} ★</strong>
              </div>
              <div className="kpi">
                <span>Corridas</span>
                <strong>{detail.total_trips ?? 0}</strong>
              </div>
              <div className="kpi">
                <span>Status</span>
                <strong>{detail.user_status}</strong>
              </div>
            </div>

            <div className="admin-driver-section">
              <h2>Documentos</h2>
              <div className="admin-docs">
                {(detail.documents || []).map((doc) => (
                  <div key={doc.id} className={`admin-doc ${statusClass(doc.status)}`}>
                    <div className="admin-doc-top">
                      <strong>
                        {doc.type === "CRLV"
                          ? `CRLV${doc.vehicle_plate ? ` (${doc.vehicle_plate})` : ""}`
                          : doc.type === "CRIMINAL_RECORD"
                            ? "Histórico criminal"
                            : doc.type}
                      </strong>
                      <span className={`pill ${statusClass(doc.status)}`}>{statusLabel(doc.status)}</span>
                    </div>
                    <div className="admin-doc-dates">
                      <span>
                        Emissão: <strong>{formatDate(doc.issued_at)}</strong>
                      </span>
                      <span>
                        Venc.: <strong>{formatDate(doc.expires_at)}</strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                className="admin-driver-message"
                disabled={
                  detail.user_status !== "IRREGULAR" &&
                  detail.user_status !== "BANNED" &&
                  detail.documents_overall_status !== "EXPIRING" &&
                  detail.documents_overall_status !== "EXPIRED"
                }
                onClick={async () => {
                  const token = getToken();
                  const evt =
                    detail.user_status === "BANNED" ||
                    detail.documents_overall_status === "EXPIRED"
                      ? "BAN"
                      : "DOC_EXPIRING";

                  const res = await fetch(
                    `http://localhost:3333/admin/messages/${driverId}/system`,
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: token ? `Bearer ${token}` : "",
                      },
                      body: JSON.stringify({ system_event: evt }),
                    }
                  );

                  const data = await res.json().catch(() => ({}));
                  if (!res.ok) {
                    alert(data.message || "Erro ao enviar mensagem automática");
                  } else {
                    alert("Mensagem automática enviada.");
                  }
                }}
              >
                Enviar mensagem automática
              </button>
            </div>

            <div className="admin-driver-section">
              <h2>Veículos</h2>
              <div className="admin-docs">
                {(detail.vehicles || []).length === 0 && (
                  <div className="admin-drivers-empty">Nenhum veículo cadastrado.</div>
                )}
                {(detail.vehicles || []).map((v) => (
                  <div key={v.id} className="admin-doc">
                    <div className="admin-doc-top">
                      <strong>
                        {v.kind === "MOTO" ? "Moto" : "Carro"} • {v.brand} {v.model}
                      </strong>
                      <span className="pill pill-blue">{v.plate}</span>
                    </div>
                    <div className="admin-doc-dates">
                      <span>
                        Cor: <strong>{v.color}</strong>
                      </span>
                      <span>
                        Ano: <strong>{v.year}</strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="admin-driver-section">
              <h2>Avaliações negativas</h2>

              {loadingReviews && <div className="admin-drivers-loading">Carregando...</div>}
              {!loadingReviews && negativeReviews.length === 0 && (
                <div className="admin-drivers-empty">Nenhuma avaliação negativa.</div>
              )}

              <div className="admin-neg-reviews">
                {negativeReviews.map((r) => (
                  <div key={r.id} className="admin-neg-review">
                    <div className="admin-neg-review-top">
                      <strong>{r.reason}</strong>
                      <span className="pill pill-yellow">
                        {r.created_at ? new Date(r.created_at).toLocaleDateString() : "-"}
                      </span>
                    </div>
                    <button
                      className="admin-neg-review-delete"
                      onClick={async () => {
                        const token = getToken();
                        const res = await fetch(
                          `http://localhost:3333/admin/reviews/negative/${r.id}`,
                          {
                            method: "DELETE",
                            headers: { Authorization: token ? `Bearer ${token}` : "" },
                          }
                        );
                        if (!res.ok) return;
                        setNegativeReviews((prev) => prev.filter((x) => x.id !== r.id));
                      }}
                    >
                      Excluir (injusta)
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="admin-drivers">
      <div className="admin-drivers-header">
        <h1>Motoristas</h1>
        <div className="admin-drivers-subtitle">
          Filtre por reputação e situação de documentos (dados reais)
        </div>
      </div>

      <div className="admin-drivers-toolbar">
        <div className="drivers-topbar">
          <input
            className="admin-drivers-search"
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
                    checked={!!statusFilters.ACTIVE}
                    onChange={(e) =>
                      setStatusFilters((p) => ({ ...p, ACTIVE: e.target.checked }))
                    }
                  />
                  Em dia
                </label>
                <label className="filter-item">
                  <input
                    type="checkbox"
                    checked={!!statusFilters.IRREGULAR}
                    onChange={(e) =>
                      setStatusFilters((p) => ({
                        ...p,
                        IRREGULAR: e.target.checked,
                      }))
                    }
                  />
                  Irregular
                </label>
                <label className="filter-item">
                  <input
                    type="checkbox"
                    checked={!!statusFilters.BANNED}
                    onChange={(e) =>
                      setStatusFilters((p) => ({ ...p, BANNED: e.target.checked }))
                    }
                  />
                  Banido
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      {loading && <div className="admin-drivers-loading">Carregando...</div>}

      {!loading && filtered.length === 0 && (
        <div className="admin-drivers-empty">Nenhum motorista encontrado.</div>
      )}

      <div className="admin-drivers-list">
        {filtered.map((d) => {
          const docStatus = d.documents_overall_status || "VALID";
          const label =
            d.user_status === "BANNED"
              ? "Banido"
              : d.user_status === "IRREGULAR"
                ? "Irregular"
                : statusLabel(docStatus);
          const cls =
            d.user_status === "BANNED"
              ? "danger"
              : d.user_status === "IRREGULAR"
                ? "warning"
                : statusClass(docStatus);

          return (
            <button
              key={d.driver_id}
              className="admin-driver-row"
              onClick={() => navigate(`/admin/drivers/${d.driver_id}`)}
            >
              <div className="admin-driver-row-avatar">
                {(d.name || "?")
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </div>

              <div className="admin-driver-row-main">
                <div className="admin-driver-row-top">
                  <div className="admin-driver-row-name">
                    <strong>{d.name}</strong>
                    <span className={`state-tag ${cls}`}>{label}</span>
                  </div>
                </div>
                <div className="admin-driver-row-bottom">
                  {d.email}
                  <span className="sep">•</span>
                  Veículos: <strong>{d.vehicles_count ?? 0}</strong>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

