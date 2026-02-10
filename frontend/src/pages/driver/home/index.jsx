import React, { useState } from "react";
import DriverMap from "../../../components/common/DriverMap";
import Sidebar from "../../../components/common/Sidebar";
import formatCurrency from "../../../utils/formatCurrency";
import "./styles.css";

export default function DriverHome() {
  const [earnings] = useState(124.5);

  return (
    <div className="driver-home">
      <div className="map-area">
        <DriverMap />
      </div>

      <Sidebar />

      <div className="earnings-box">
        <strong>{formatCurrency(earnings)}</strong>
      </div>

      <button className="startButton">
        <span className="ring" />
        <span className="startText">INICIAR</span>
      </button>
    </div>
  );
}
