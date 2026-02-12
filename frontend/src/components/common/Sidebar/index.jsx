import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FiMenu,
  FiMail,
  FiDollarSign,
  FiUser,
  FiHome,
  FiLogOut,
  FiUsers,
  FiClipboard,
} from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import useWebSocket from "../../../hooks/useWebSocket";
import "./styles.css";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { events } = useWebSocket();
  const processedEventsRef = useRef(0);

  const isAdmin = user?.role === "ADMIN";
  const isDriver = user?.role === "DRIVER";
  const isBannedDriver = isDriver && user?.status === "BANNED";

  // Notificações (incrementais via WS; zera ao entrar na tela)
  const [driverInboxNotifs, setDriverInboxNotifs] = useState(0);
  const [adminInboxNotifs, setAdminInboxNotifs] = useState(0);
  const [adminRenewalsNotifs, setAdminRenewalsNotifs] = useState(0);
  const [adminRequestsNotifs, setAdminRequestsNotifs] = useState(3); // MOCK atual de Solicitações

  function close() {
    setOpen(false);
  }

  function goTo(path) {
    navigate(path);
    close();
  }

  function handleLogout() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("user");
    // compat
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    logout();
    navigate("/login");
    close();
  }

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("") || "?";

  const repNum =
    user?.reputation_score === null || user?.reputation_score === undefined
      ? NaN
      : Number.parseFloat(String(user.reputation_score));
  const reputation = Number.isFinite(repNum) ? repNum.toFixed(1) : "-";

  const inAdminMessages = location.pathname.startsWith("/admin/messages");
  const inDriverMessages = location.pathname.startsWith("/driver/messages");
  const inAdminRenewals = location.pathname.startsWith("/admin/renewals");
  const inAdminRequests = location.pathname.startsWith("/admin/requests");

  useEffect(() => {
    // limpa quando o usuário está na tela correspondente
    if (isAdmin) {
      if (inAdminMessages && adminInboxNotifs !== 0) setAdminInboxNotifs(0);
      if (inAdminRenewals && adminRenewalsNotifs !== 0) setAdminRenewalsNotifs(0);
      if (inAdminRequests && adminRequestsNotifs !== 0) setAdminRequestsNotifs(0);
    }
    if (isDriver) {
      if (inDriverMessages && driverInboxNotifs !== 0) setDriverInboxNotifs(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, isAdmin, isDriver]);

  useEffect(() => {
    if (!events || events.length === 0) return;

    let incDriverInbox = 0;
    let incAdminInbox = 0;
    let incAdminRenewals = 0;

    for (let i = processedEventsRef.current; i < events.length; i++) {
      const ev = events[i];
      if (!ev) continue;

      if (ev.type === "CHAT_MESSAGE") {
        const senderRole = ev?.message?.sender_role;

        // Motorista: notifica mensagens do ADMIN/SYSTEM quando não está no chat
        if (isDriver && !inDriverMessages && (senderRole === "ADMIN" || senderRole === "SYSTEM")) {
          incDriverInbox += 1;
        }

        // Admin: notifica mensagens do DRIVER quando não está no inbox/chat
        if (isAdmin && !inAdminMessages && senderRole === "DRIVER") {
          incAdminInbox += 1;
        }
      }

      if (ev.type === "RENEWAL_CREATED") {
        if (isAdmin && !inAdminRenewals) incAdminRenewals += 1;
      }
    }

    processedEventsRef.current = events.length;

    if (incDriverInbox) setDriverInboxNotifs((p) => p + incDriverInbox);
    if (incAdminInbox) setAdminInboxNotifs((p) => p + incAdminInbox);
    if (incAdminRenewals) setAdminRenewalsNotifs((p) => p + incAdminRenewals);
  }, [events, isAdmin, isDriver, inAdminMessages, inAdminRenewals, inDriverMessages]);

  const totalNotifs = useMemo(() => {
    if (isAdmin) return adminInboxNotifs + adminRenewalsNotifs + adminRequestsNotifs;
    if (isDriver) return driverInboxNotifs;
    return 0;
  }, [isAdmin, isDriver, adminInboxNotifs, adminRenewalsNotifs, adminRequestsNotifs, driverInboxNotifs]);

  return (
    <>
      {/* ☰ HAMBÚRGUER (some quando o menu está aberto) */}
      {!open && (
        <div className="sidebar-hamburger" onClick={() => setOpen(true)}>
          <FiMenu size={26} />
          {totalNotifs > 0 && <span className="sidebar-mini-badge">{totalNotifs}</span>}
        </div>
      )}

      {/* OVERLAY PARA FECHAR AO CLICAR FORA */}
      {open && <div className="sidebar-overlay" onClick={close} />}

      {/* SIDEBAR */}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        {/* HEADER DE PERFIL */}
        <div
          className="sidebar-profile"
          onClick={() => (isAdmin ? goTo("/admin") : goTo("/driver/account"))}
        >
          <div className="sidebar-profile-avatar">
            <span>{initials}</span>
          </div>
          <div className="sidebar-profile-info">
            <strong className="sidebar-profile-name">
              {user?.name || (isAdmin ? "Admin Buenos" : "Motorista Buenos")}
            </strong>
            {isDriver ? (
              <span className="sidebar-profile-reputation">
                Reputação: {reputation} ★
              </span>
            ) : (
              <span className="sidebar-profile-role">Administrador</span>
            )}
          </div>
        </div>

        {/* NAVEGAÇÃO */}
        <nav>
          {isAdmin ? (
            <>
              <button onClick={() => goTo("/admin")}>
                <FiHome />
                Home
              </button>

              <button onClick={() => goTo("/admin/drivers")}>
                <FiUsers />
                Motoristas
              </button>

              <button onClick={() => goTo("/admin/requests")}>
                <FiClipboard />
                Solicitações
                {adminRequestsNotifs > 0 && <span className="nav-badge">{adminRequestsNotifs}</span>}
              </button>

              <button onClick={() => goTo("/admin/messages")}>
                <FiMail />
                Caixa de entrada
                {adminInboxNotifs > 0 && <span className="nav-badge">{adminInboxNotifs}</span>}
              </button>

              <button onClick={() => goTo("/admin/renewals")}>
                <FiDollarSign />
                Renovação
                {adminRenewalsNotifs > 0 && <span className="nav-badge">{adminRenewalsNotifs}</span>}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => goTo("/driver")}>
                <FiHome />
                Home
              </button>

              <button onClick={() => goTo("/driver/messages")}>
                <FiMail />
                Caixa de entrada
                {driverInboxNotifs > 0 && <span className="nav-badge">{driverInboxNotifs}</span>}
              </button>

              <button
                onClick={() => (!isBannedDriver ? goTo("/driver/wallet") : null)}
                disabled={isBannedDriver}
                className={isBannedDriver ? "nav-disabled" : ""}
                title={
                  isBannedDriver
                    ? "Carteira desabilitada enquanto a conta estiver banida"
                    : ""
                }
              >
                <FiDollarSign />
                Carteira
              </button>

              <button onClick={() => goTo("/driver/account")}>
                <FiUser />
                Conta
              </button>
            </>
          )}

          <button onClick={handleLogout}>
            <FiLogOut />
            Sair
          </button>
        </nav>
      </aside>
    </>
  );
}
