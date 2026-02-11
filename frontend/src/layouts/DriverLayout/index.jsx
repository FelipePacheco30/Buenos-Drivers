import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "../../components/common/Sidebar";
import { useAuth } from "../../context/AuthContext";
import "./styles.css";

export default function DriverLayout() {
  const { user, loading } = useAuth();

  if (loading) return null;

  // impede acessar /driver/* estando logado como ADMIN (evita 403 em endpoints DRIVER)
  if (user?.role && user.role !== "DRIVER") {
    return <Navigate to={user.role === "ADMIN" ? "/admin" : "/login"} replace />;
  }

  return (
    <div className="driver-layout">
      {/* Sidebar com hambúrguer próprio */}
      <Sidebar />

      {/* Conteúdo do Outlet */}
      <div className="driver-layout-content">
        <Outlet />
      </div>
    </div>
  );
}
