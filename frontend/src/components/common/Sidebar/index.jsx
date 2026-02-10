import React, { useState } from "react";
import { FiMenu, FiMail, FiDollarSign, FiUser } from "react-icons/fi";
import "./styles.css";

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ☰ HAMBURGUER */}
      <div className="sidebar-hamburger" onClick={() => setOpen(!open)}>
        <FiMenu size={26} />
      </div>

      {/* SIDEBAR */}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <nav>
          <button>
            <FiMail />
            Caixa de entrada
          </button>

          <button>
            <FiDollarSign />
            Carteira
          </button>

          <button>
            <FiUser />
            Conta
          </button>
        </nav>
      </aside>
    </>
  );
}
