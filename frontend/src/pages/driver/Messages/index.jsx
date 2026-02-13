import React, { useEffect, useMemo, useRef, useState } from "react";
import { FiEye, FiSend } from "react-icons/fi";
import useWebSocket from "../../../hooks/useWebSocket";
import { getToken } from "../../../services/api";
import "./styles.css";

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

export default function DriverMessages() {
  const { events, sendMessage } = useWebSocket();
  const [loading, setLoading] = useState(true);
  const [thread, setThread] = useState([]);
  const [draft, setDraft] = useState("");

  const endRef = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const token = getToken();
        const res = await fetch("http://localhost:3333/driver/messages", {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        const data = await res.json();
        setThread(res.ok && Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (!endRef.current) return;
    endRef.current.scrollIntoView({ behavior: "smooth" });
  }, [loading, thread]);

  
  useEffect(() => {
    let cancelled = false;
    async function markRead() {
      try {
        const token = getToken();
        await fetch("http://localhost:3333/driver/messages/read", {
          method: "POST",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
      } catch {
        
      } finally {
        if (cancelled) return;
      }
    }
    markRead();
    return () => {
      cancelled = true;
    };
  }, []);

  
  useEffect(() => {
    const last = events[events.length - 1];
    if (!last || last.type !== "CHAT_MESSAGE") return;

    
    setThread((prev) =>
      prev.some((m) => m.id === last.message.id) ? prev : [...prev, last.message]
    );
  }, [events]);

  
  useEffect(() => {
    const last = events[events.length - 1];
    if (!last || last.type !== "CHAT_READ") return;
    const ids = Array.isArray(last.ids) ? last.ids : [];
    if (ids.length === 0) return;

    setThread((prev) =>
      prev.map((m) => {
        if (!ids.includes(m.id)) return m;
        if (last.reader_role === "ADMIN") {
          return { ...m, read_by_admin_at: last.read_at || m.read_by_admin_at || null };
        }
        if (last.reader_role === "DRIVER") {
          return { ...m, read_by_driver_at: last.read_at || m.read_by_driver_at || null };
        }
        return m;
      })
    );
  }, [events]);

  const canSend = useMemo(() => draft.trim().length > 0, [draft]);

  async function send() {
    const msg = draft.trim();
    if (!msg) return;

    
    const ok = sendMessage({ type: "CHAT_SEND", body: msg });
    setDraft("");

    
    if (!ok) {
      try {
        const token = getToken();
        await fetch("http://localhost:3333/driver/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ body: msg }),
        });
      } catch {
        
      }
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

  return (
    <div className="driver-chat">
      <div className="driver-thread-header">
        <div className="driver-thread-title">
          <strong>Administração Buenos</strong>
          <span>Chat com o suporte</span>
        </div>
      </div>

      <div className="driver-chat-body">
        {loading && <div className="driver-chat-state">Carregando…</div>}
        {!loading &&
          threadWithSeparators.map((m) => {
            if (m.__type === "DAY") {
              return (
                <div key={`day-${m.key}`} className="day-pill">
                  {m.label}
                </div>
              );
            }

            const isMe = m.sender_role === "DRIVER";
            const isSystem = m.sender_role === "SYSTEM";
            const showSeen = isMe && !isSystem;
            const seen = !!m.read_by_admin_at;

            return (
              <div
                key={m.id}
                className={`driver-bubble ${isMe ? "me" : "them"} ${
                  isSystem
                    ? `system system-${String(m.system_event || "DOC_EXPIRING").toLowerCase()}`
                    : ""
                }`}
              >
                <div className="driver-bubble-role">{m.sender_role}</div>
                <div className="driver-bubble-text">{m.body}</div>
                <div className="driver-bubble-foot">
                  <span className="driver-bubble-time">{formatTime(m.created_at)}</span>
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

      <div className="driver-chat-compose">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Escreva uma mensagem…"
        />
        <button className="send-icon" onClick={send} disabled={!canSend} aria-label="Enviar">
          <FiSend />
        </button>
      </div>
    </div>
  );
}
