import React, { useEffect, useMemo, useState } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import DriverMap from "../../../components/common/DriverMap";
import { useAuth } from "../../../context/AuthContext";
import formatCurrency from "../../../utils/formatCurrency";
import { getToken } from "../../../services/api";
import "./styles.css";

export default function DriverHome() {
  const { user } = useAuth();
  const [earnings] = useState(124.5);
  const [showBannedModal, setShowBannedModal] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");

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

  useEffect(() => {
    async function loadVehicles() {
      if (!user || user.role !== "DRIVER") return;
      if (isBanned) return;
      try {
        setVehiclesLoading(true);
        const token = getToken();
        const res = await fetch("http://localhost:3333/vehicles", {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        const data = await res.json().catch(() => []);
        setVehicles(res.ok && Array.isArray(data) ? data : []);
      } finally {
        setVehiclesLoading(false);
      }
    }
    loadVehicles();
  }, [user, isBanned]);

  function start() {
    if (isBanned) return;
    if (vehicles.length > 1) {
      setShowVehicleModal(true);
      return;
    }
    // 1 veículo: segue direto (trip start será implementado depois)
    alert("Pronto! Você está online para receber corridas.");
  }

  function confirmVehicle() {
    if (!selectedVehicleId) return;
    setShowVehicleModal(false);
    alert("Veículo selecionado. Você está online para receber corridas.");
  }

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
        <button className="startButton" onClick={start} disabled={vehiclesLoading}>
          <span className="ring" />
          <span className="startText">{vehiclesLoading ? "..." : "INICIAR"}</span>
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

      {showVehicleModal && (
        <>
          <div
            className="driver-home-modal-overlay"
            onClick={() => setShowVehicleModal(false)}
          />
          <div className="driver-home-modal" role="dialog" aria-modal="true">
            <h2>Escolha o veículo</h2>
            <p>Você tem mais de um veículo. Selecione qual vai usar nesta corrida.</p>

            <div className="vehicle-pick-list">
              {vehicles.map((v) => (
                <label key={v.id} className={`vehicle-pick ${selectedVehicleId === v.id ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="vehicle"
                    value={v.id}
                    checked={selectedVehicleId === v.id}
                    onChange={() => setSelectedVehicleId(v.id)}
                  />
                  <div className="vehicle-pick-main">
                    <strong>
                      {v.model} • {v.color} • {v.year}
                    </strong>
                    <span>{v.plate}</span>
                  </div>
                </label>
              ))}
            </div>

            <button onClick={confirmVehicle} disabled={!selectedVehicleId}>
              Confirmar
            </button>
          </div>
        </>
      )}
    </div>
  );
}
