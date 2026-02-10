import React, { useState } from "react";
import { FiMenu, FiMail, FiDollarSign, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "./styles.css";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  function goTo(path) {
    navigate(path);
    setOpen(false);
  }

  return (
    <>
      {/* ☰ HAMBURGUER */}
      <div className="sidebar-hamburger" onClick={() => setOpen(!open)}>
        <FiMenu size={26} />
      </div>

      {/* SIDEBAR */}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <nav>
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
        </nav>
      </aside>
    </>
  );
}
