import React, { useState } from "react";
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
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import "./styles.css";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const isDriver = user?.role === "DRIVER";
  const isBannedDriver = isDriver && user?.status === "BANNED";

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

  const reputation =
    typeof user?.reputation_score === "number"
      ? user.reputation_score.toFixed(1)
      : "-";

  return (
    <>
      {/* ☰ HAMBÚRGUER (some quando o menu está aberto) */}
      {!open && (
        <div className="sidebar-hamburger" onClick={() => setOpen(true)}>
          <FiMenu size={26} />
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
              </button>

              <button onClick={() => goTo("/admin/messages")}>
                <FiMail />
                Caixa de entrada
              </button>

              <button onClick={() => goTo("/admin/renewals")}>
                <FiDollarSign />
                Renovação
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
