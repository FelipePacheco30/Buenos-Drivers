import React, { useEffect, useMemo, useState } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import DriverMap from "../../../components/common/DriverMap";
import { useAuth } from "../../../context/AuthContext";
import formatCurrency from "../../../utils/formatCurrency";
import "./styles.css";

export default function DriverHome() {
  const { user } = useAuth();
  const [earnings] = useState(124.5);
  const [showBannedModal, setShowBannedModal] = useState(false);

  const isBanned = user?.status === "BANNED";

  useEffect(() => {
    if (!isBanned) return;
    const flag = sessionStorage.getItem("banned_modal");
    if (flag === "1") {
      setShowBannedModal(true);
      sessionStorage.removeItem("banned_modal");
    }
  }, [isBanned]);

  const blockedMessage = useMemo(() => {
    return "Você está banido e não pode realizar viagens até regularizar sua situação.";
  }, []);

  return (
    <div className="driver-home">
      <div className="map-area">
        <DriverMap />
        {isBanned && (
          <div className="driver-home-blocked" role="status" aria-live="polite">
            <div className="driver-home-blocked-card">
              <div className="driver-home-blocked-icon" aria-hidden="true">
                <FiAlertTriangle />
              </div>
              <div className="driver-home-blocked-text">
                <strong>Viagens desabilitadas</strong>
                <span>{blockedMessage}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {!isBanned && (
        <div className="earnings-box">
          <strong>{formatCurrency(earnings)}</strong>
        </div>
      )}

      {!isBanned && (
        <button className="startButton">
          <span className="ring" />
          <span className="startText">INICIAR</span>
        </button>
      )}

      {showBannedModal && (
        <>
          <div className="driver-home-modal-overlay" onClick={() => setShowBannedModal(false)} />
          <div className="driver-home-modal" role="dialog" aria-modal="true">
            <h2>Conta bloqueada</h2>
            <p>{blockedMessage}</p>
            <button onClick={() => setShowBannedModal(false)}>Entendi</button>
          </div>
        </>
      )}
    </div>
  );
}
