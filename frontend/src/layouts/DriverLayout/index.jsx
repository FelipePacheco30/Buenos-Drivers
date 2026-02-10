import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import './styles.css';

export default function DriverLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="driver-layout">
      {/* Ícone ☰ */}
      <button
        className="driver-menu-button"
        onClick={() => setSidebarOpen(true)}
      >
        ☰
      </button>

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <Outlet />
    </div>
  );
}
