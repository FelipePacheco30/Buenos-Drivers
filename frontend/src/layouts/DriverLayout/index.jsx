import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Sidebar from "../../components/common/Sidebar";
import { useAuth } from "../../context/AuthContext";
import "./styles.css";

export default function DriverLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  
  if (user?.role && user.role !== "DRIVER") {
    return <Navigate to={user.role === "ADMIN" ? "/admin" : "/login"} replace />;
  }

  
  if (user?.status === "BANNED") {
    const p = location.pathname || "";
    if (p.startsWith("/driver/wallet")) {
      return <Navigate to="/driver" replace />;
    }
  }

  return (
    <div className="driver-layout">
      {}
      <Sidebar />

      {}
      <div className="driver-layout-content">
        <Outlet />
      </div>
    </div>
  );
}
