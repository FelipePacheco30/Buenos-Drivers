import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/common/Sidebar";
import "./styles.css";

export default function AdminLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="admin-layout-loading">
        <span>Carregando...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "ADMIN") {
    return <Navigate to={user.role === "DRIVER" ? "/driver" : "/login"} replace />;
  }

  return (
    <div className="admin-layout">
      {/* Sidebar (mesmo padrão do motorista, com seções de admin) */}
      <Sidebar />
      <main className="admin-layout-content">
        <Outlet />
      </main>
    </div>
  );
}
