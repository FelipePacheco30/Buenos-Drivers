import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiEye, FiFilter, FiSend } from "react-icons/fi";
import useWebSocket from "../../../hooks/useWebSocket";
import { getToken } from "../../../services/api";
import "./styles.css";

function stateLabel(userStatus, docsStatus) {
  if (userStatus === "BANNED") return "Banido";
  if (userStatus === "IRREGULAR") return "Irregular";
  // fallback para dados antigos
  if (docsStatus === "EXPIRED") return "Banido";
  if (docsStatus === "EXPIRING") return "Irregular";
  return "Em dia";
}

function stateClass(userStatus, docsStatus) {
  if (userStatus === "BANNED") return "danger";
  if (userStatus === "IRREGULAR") return "warning";
  // fallback para dados antigos
  if (docsStatus === "EXPIRED") return "danger";
  if (docsStatus === "EXPIRING") return "warning";
  return "success";
}

function formatTime(dateLike) {
  if (!dateLike) return "";
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function dayKey(dateLike) {
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "invalid";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function formatDay(dateLike) {
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function senderLabelForPreview(senderRole) {
  if (senderRole === "ADMIN") return "Você";
  if (senderRole === "DRIVER") return "Motorista";
  return "Sistema";
}

export default function AdminMessages() {
  const navigate = useNavigate();
  const { driverId } = useParams();
  const { events } = useWebSocket();

  const filterRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [query, setQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilters, setStatusFilters] = useState({
    VALID: true,
    EXPIRING: true,
    EXPIRED: true,
  });

  const [threadLoading, setThreadLoading] = useState(false);
  const [thread, setThread] = useState([]);
  const [draft, setDraft] = useState("");

  const endRef = useRef(null);

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
        const res = await fetch("http://localhost:3333/admin/messages", {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        const data = await res.json();
        setConversations(res.ok && Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = conversations;
    if (q) {
      list = list.filter((c) => {
        const name = String(c.name || "").toLowerCase();
        const email = String(c.email || "").toLowerCase();
        return name.includes(q) || email.includes(q);
      });
    }

    const allowed = statusFilters;
    list = list.filter((c) => {
      const s = c.documents_overall_status || "VALID";
      return !!allowed[s];
    });

    return list;
  }, [conversations, query, statusFilters]);

  useEffect(() => {
    async function loadThread() {
      if (!driverId) {
        setThread([]);
        return;
      }
      try {
        setThreadLoading(true);
        const token = getToken();
        const res = await fetch(`http://localhost:3333/admin/messages/${driverId}`, {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        const data = await res.json();
        setThread(res.ok && Array.isArray(data) ? data : []);
      } finally {
        setThreadLoading(false);
      }
    }
    loadThread();
  }, [driverId]);

  // realtime: recebe mensagens novas (admin/driver/system) e atualiza lista e thread
  useEffect(() => {
    const last = events[events.length - 1];
    if (!last || last.type !== "CHAT_MESSAGE") return;

    const msg = last.message;
    const dId = last.driver_id;

    // atualiza thread se estamos na conversa aberta
    if (driverId && dId === driverId) {
      setThread((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
    }

    // atualiza preview na lista
    setConversations((prev) =>
      prev.map((c) =>
        c.driver_id === dId
          ? {
              ...c,
              last_message: msg.body,
              last_sender_role: msg.sender_role,
              last_system_event: msg.system_event,
              last_message_at: msg.created_at,
            }
          : c
      )
    );
  }, [events, driverId]);

  // realtime: “visto” (read receipts)
  useEffect(() => {
    const last = events[events.length - 1];
    if (!last || last.type !== "CHAT_READ") return;
    if (!driverId || last.driver_id !== driverId) return;

    const ids = Array.isArray(last.ids) ? last.ids : [];
    if (ids.length === 0) return;

    setThread((prev) =>
      prev.map((m) => {
        if (!ids.includes(m.id)) return m;
        if (last.reader_role === "DRIVER") {
          return { ...m, read_by_driver_at: last.read_at || m.read_by_driver_at || null };
        }
        if (last.reader_role === "ADMIN") {
          return { ...m, read_by_admin_at: last.read_at || m.read_by_admin_at || null };
        }
        return m;
      })
    );
  }, [events, driverId]);

  useEffect(() => {
    if (!endRef.current) return;
    endRef.current.scrollIntoView({ behavior: "smooth" });
  }, [threadLoading, thread]);

  const active = useMemo(() => {
    if (!driverId) return null;
    return conversations.find((c) => c.driver_id === driverId) || null;
  }, [conversations, driverId]);

  async function send() {
    if (!driverId) return;
    const msg = draft.trim();
    if (!msg) return;

    try {
      const token = getToken();
      const res = await fetch(`http://localhost:3333/admin/messages/${driverId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ body: msg }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Erro ao enviar mensagem");
        return;
      }

      setDraft("");
      // o WS vai refletir em tempo real; ainda assim, adiciona local pra ficar instantâneo
      setThread((prev) => (prev.some((m) => m.id === data.id) ? prev : [...prev, data]));
    } catch {
      alert("Erro ao enviar mensagem");
    }
  }

  const threadWithSeparators = useMemo(() => {
    const out = [];
    let lastDay = null;
    for (const m of thread) {
      const k = dayKey(m.created_at);
      if (k !== lastDay) {
        lastDay = k;
        out.push({ __type: "DAY", key: k, label: formatDay(m.created_at) });
      }
      out.push(m);
    }
    return out;
  }, [thread]);

  const isListMode = !driverId;

  return (
    <div className="admin-messages">
      {isListMode ? (
        <div className="admin-messages-header">
          <h1>Caixa de entrada</h1>
          <div className="admin-messages-subtitle">
            Conversas com motoristas (SYSTEM, ADMIN e respostas do motorista)
          </div>
        </div>
      ) : null}

      <div className="admin-messages-layout">
        {isListMode ? (
          <aside className="admin-messages-list">
            <div className="list-topbar">
              <input
                className="search"
                placeholder="Buscar motorista…"
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
                        checked={!!statusFilters.VALID}
                        onChange={(e) =>
                          setStatusFilters((p) => ({ ...p, VALID: e.target.checked }))
                        }
                      />
                      Em dia
                    </label>
                    <label className="filter-item">
                      <input
                        type="checkbox"
                        checked={!!statusFilters.EXPIRING}
                        onChange={(e) =>
                          setStatusFilters((p) => ({ ...p, EXPIRING: e.target.checked }))
                        }
                      />
                      Próximo do vencimento
                    </label>
                    <label className="filter-item">
                      <input
                        type="checkbox"
                        checked={!!statusFilters.EXPIRED}
                        onChange={(e) =>
                          setStatusFilters((p) => ({ ...p, EXPIRED: e.target.checked }))
                        }
                      />
                      Vencido (banido)
                    </label>
                  </div>
                )}
              </div>
            </div>

            {loading && <div className="state">Carregando…</div>}
            {!loading && filtered.length === 0 && <div className="state">Nenhuma conversa encontrada.</div>}

            <div className="contacts">
              {filtered.map((c) => {
                const docStatus = c.documents_overall_status || "VALID";
                const lastRole = c.last_sender_role || null;
                const lastMsg = c.last_message ? String(c.last_message) : "";
                const lastAt = c.last_message_at || null;
                const stLabel = stateLabel(c.user_status, docStatus);
                const stClass = stateClass(c.user_status, docStatus);
                return (
                  <button
                    key={c.driver_id}
                    className="contact"
                    onClick={() => navigate(`/admin/messages/${c.driver_id}`)}
                  >
                    <div className="avatar circle">
                      {(c.name || "?")
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </div>

                    <div className="contact-main">
                      <div className="contact-top">
                        <div className="contact-name-row">
                          <strong className="name">{c.name}</strong>
                          <span className={`state-tag ${stClass}`}>{stLabel}</span>
                        </div>
                        <span className="time">{lastAt ? formatTime(lastAt) : ""}</span>
                      </div>

                      <div className="contact-bottom">
                        <span className="preview">
                          <strong className="preview-who">{senderLabelForPreview(lastRole)}:</strong>{" "}
                          {lastMsg ? lastMsg : "Sem mensagens"}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>
        ) : (
          <section className="admin-messages-thread fullscreen">
            <div className="thread-header">
              <button
                className="thread-back-icon"
                aria-label="Voltar"
                onClick={() => navigate("/admin/messages")}
              >
                <FiArrowLeft />
              </button>

              <button
                className="thread-driver"
                onClick={() => navigate(`/admin/drivers/${driverId}`)}
                title="Ver motorista"
              >
                <div className="avatar circle small" aria-hidden="true">
                  {(active?.name || "?")
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <strong className="thread-driver-name">{active?.name || "Motorista"}</strong>
              </button>
            </div>

            <div className="thread-body">
              {threadLoading && <div className="state">Carregando conversa…</div>}

              {!threadLoading &&
                threadWithSeparators.map((m) => {
                  if (m.__type === "DAY") {
                    return (
                      <div key={`day-${m.key}`} className="day-pill">
                        {m.label}
                      </div>
                    );
                  }

                  const isMe = m.sender_role === "ADMIN";
                  const isSystem = m.sender_role === "SYSTEM";
                  const showSeen = isMe && !isSystem;
                  const seen = !!m.read_by_driver_at;

                  return (
                    <div
                      key={m.id}
                      className={`bubble ${isMe ? "me" : "them"} ${
                        isSystem
                          ? `system system-${String(m.system_event || "DOC_EXPIRING").toLowerCase()}`
                          : ""
                      }`}
                    >
                      <div className="bubble-role">{m.sender_role}</div>
                      <div className="bubble-text">{m.body}</div>
                      <div className="bubble-foot">
                        <span className="bubble-time">{formatTime(m.created_at)}</span>
                        {showSeen && (
                          <span className={`seen ${seen ? "on" : ""}`} title={seen ? "Visualizada" : "Não visualizada"}>
                            <FiEye />
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              <div ref={endRef} />
            </div>

            <div className="thread-compose">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Escreva uma mensagem…"
              />
              <button className="send-icon" onClick={send} aria-label="Enviar">
                <FiSend />
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

