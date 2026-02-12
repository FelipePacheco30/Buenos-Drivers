import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getToken } from "../../../services/api";
import useWebSocket from "../../../hooks/useWebSocket";
import "./styles.css";

export default function AdminRenewals() {
  const navigate = useNavigate();
  const { renewalId } = useParams();
  const { events } = useWebSocket();
  const processedEventsRef = useRef(0);

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");

  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState(null);

  // validação local (não persiste) igual Solicitações
  const [validatedByRenewal, setValidatedByRenewal] = useState({});

  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch("http://localhost:3333/admin/renewals", {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      const data = await res.json().catch(() => []);
      setItems(res.ok && Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDetail = useCallback(async (id) => {
    if (!id) {
      setDetail(null);
      return;
    }
    setDetailLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`http://localhost:3333/admin/renewals/${id}`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      const data = await res.json().catch(() => null);
      setDetail(res.ok ? data : null);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    loadDetail(renewalId);
  }, [renewalId, loadDetail]);

  useEffect(() => {
    if (!events || events.length === 0) return;

    let shouldReloadList = false;
    let shouldReloadDetail = false;

    for (let i = processedEventsRef.current; i < events.length; i++) {
      const ev = events[i];
      if (!ev) continue;
      if (ev.type === "RENEWAL_CREATED" || ev.type === "RENEWAL_UPDATED") {
        shouldReloadList = true;
        if (renewalId && ev.renewal_id === renewalId) {
          shouldReloadDetail = true;
        }
      }
    }

    processedEventsRef.current = events.length;

    if (shouldReloadList) loadList();
    if (shouldReloadDetail) loadDetail(renewalId);
  }, [events, loadList, loadDetail, renewalId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = items;
    if (q) {
      list = list.filter((r) => {
        const name = String(r.name || "").toLowerCase();
        const email = String(r.email || "").toLowerCase();
        return name.includes(q) || email.includes(q);
      });
    }
    return list;
  }, [items, query]);

  function formatDate(dateLike) {
    if (!dateLike) return "-";
    const d = new Date(dateLike);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString();
  }

  function docLabel(doc) {
    const t = String(doc.type || "");
    if (t === "CRIMINAL_RECORD") return "Histórico criminal";
    if (t === "CRLV") {
      const plate = doc.vehicle_plate ? ` (${doc.vehicle_plate})` : "";
      return `CRLV${plate}`;
    }
    return t;
  }

  if (renewalId) {
    const validated = validatedByRenewal[renewalId] || {};
    const docs = detail?.documents || [];
    const vehicleAdd = detail?.vehicle_add || null;

    const allValidated =
      docs.length > 0 ? docs.every((d) => !!validated[`${d.type}:${d.vehicle_id || ""}`]) : true;

    return (
      <div className="admin-renewals">
        <div className="admin-renewals-topbar">
          <button className="admin-renewals-back" onClick={() => navigate("/admin/renewals")}>
            Voltar
          </button>
          <div className="admin-renewals-topbar-title">Renovação</div>
        </div>

        {detailLoading && <div className="state">Carregando…</div>}
        {!detailLoading && !detail && <div className="state">Solicitação não encontrada.</div>}

        {!detailLoading && detail && (
          <div className="admin-renewal-detail">
            <div className="admin-renewal-header">
              <div className="admin-renewal-avatar">
                {(detail.name || "?")
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div className="admin-renewal-meta">
                <div className="admin-renewal-name">{detail.name}</div>
                <div className="admin-renewal-sub">
                  <span className="pill pill-blue">{detail.email}</span>
                  <span className="pill pill-yellow">{formatDate(detail.created_at)}</span>
                </div>
              </div>
            </div>

            <div className="admin-renewal-section">
              <h2>Documentos</h2>
              <div className="admin-renewal-docs">
                {docs.length === 0 && <div className="state">Nenhum documento nesta solicitação.</div>}
                {docs.map((doc) => {
                  const k = `${doc.type}:${doc.vehicle_id || ""}`;
                  const ok = !!validated[k];
                  return (
                    <div key={doc.id} className="admin-renewal-doc">
                      <div className="admin-renewal-doc-top">
                        <div className="admin-renewal-doc-title">
                          <strong>{docLabel(doc)}</strong>
                          {ok && <span className="doc-check">✓</span>}
                        </div>
                        <div className="admin-renewal-doc-actions">
                          <button
                            className="btn-secondary"
                            onClick={() =>
                              alert("Visualização será implementada quando houver upload de PDF/foto.")
                            }
                          >
                            Ver
                          </button>
                          <button
                            className={`btn-primary ${ok ? "ok" : ""}`}
                            onClick={() =>
                              setValidatedByRenewal((prev) => ({
                                ...prev,
                                [renewalId]: { ...(prev[renewalId] || {}), [k]: true },
                              }))
                            }
                          >
                            Validar
                          </button>
                        </div>
                      </div>

                      <div className="admin-renewal-doc-dates">
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

              {vehicleAdd && (
                <div className="admin-renewal-vehicle">
                  <h2>Adicionar veículo</h2>
                  <div className="vehicle-box">
                    <strong>
                      {vehicleAdd.model} • {vehicleAdd.color} • {vehicleAdd.year}
                    </strong>
                    <span>Placa: {vehicleAdd.plate}</span>
                  </div>
                </div>
              )}

              <button
                className="admin-renewal-accept"
                disabled={!allValidated || detail.status !== "PENDING"}
                onClick={async () => {
                  const token = getToken();
                  const res = await fetch(
                    `http://localhost:3333/admin/renewals/${renewalId}/approve`,
                    {
                      method: "POST",
                      headers: { Authorization: token ? `Bearer ${token}` : "" },
                    }
                  );
                  const data = await res.json().catch(() => ({}));
                  if (!res.ok) {
                    alert(data.message || "Erro ao aprovar renovação");
                    return;
                  }
                  navigate("/admin/renewals");
                }}
              >
                Aceitar renovação
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="admin-renewals">
      <div className="admin-renewals-header">
        <h1>Renovações</h1>
        <div className="admin-renewals-subtitle">
          Solicitações de atualização de documentos e adição de veículos (dados reais)
        </div>
        <div className="admin-renewals-retention">
          As solicitações ficam armazenadas por <strong>7 dias</strong>. Após esse período, serão excluídas automaticamente.
        </div>
      </div>

      <div className="admin-renewals-toolbar">
        <input
          className="admin-renewals-search"
          placeholder="Buscar por nome ou email…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading && <div className="state">Carregando…</div>}
      {!loading && filtered.length === 0 && <div className="state">Nenhuma solicitação.</div>}

      <div className="admin-renewals-list">
        {filtered.map((r) => (
          <button
            key={r.id}
            className="admin-renewal-row"
            onClick={() => navigate(`/admin/renewals/${r.id}`)}
          >
            <div className="admin-renewal-row-avatar">
              {(r.name || "?")
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </div>

            <div className="admin-renewal-row-main">
              <div className="admin-renewal-row-top">
                <strong className="admin-renewal-row-name">{r.name}</strong>
                <span className="admin-renewal-row-date">{formatDate(r.created_at)}</span>
              </div>
              <div className="admin-renewal-row-bottom">{r.email}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

