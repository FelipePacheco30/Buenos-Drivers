import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/common/Sidebar";
import "./styles.css";

export default function DriverLayout() {
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
