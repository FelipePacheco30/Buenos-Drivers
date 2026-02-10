import React, { useState } from "react";
import {
  FiMenu,
  FiMail,
  FiDollarSign,
  FiUser,
  FiHome,
  FiLogOut,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import "./styles.css";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  function close() {
    setOpen(false);
  }

  function goTo(path) {
    navigate(path);
    close();
  }

  function handleLogout() {
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
          onClick={() => goTo("/driver/account")}
        >
          <div className="sidebar-profile-avatar">
            <span>{initials}</span>
          </div>
          <div className="sidebar-profile-info">
            <strong className="sidebar-profile-name">
              {user?.name || "Motorista Buenos"}
            </strong>
            <span className="sidebar-profile-reputation">
              Reputação: {reputation} ★
            </span>
          </div>
        </div>

        {/* NAVEGAÇÃO */}
        <nav>
          <button onClick={() => goTo("/driver")}>
            <FiHome />
            Home
          </button>

          <button onClick={() => goTo("/driver/messages")}>
            <FiMail />
            Caixa de entrada
          </button>

          <button onClick={() => goTo("/driver/wallet")}>
            <FiDollarSign />
            Carteira
          </button>

          <button onClick={() => goTo("/driver/account")}>
            <FiUser />
            Conta
          </button>

          <button onClick={handleLogout}>
            <FiLogOut />
            Sair
          </button>
        </nav>
      </aside>
    </>
  );
}
