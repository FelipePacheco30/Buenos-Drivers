import React, { useEffect, useMemo, useRef, useState } from "react";
import { FiAlertTriangle, FiPackage, FiUsers } from "react-icons/fi";
import DriverMap from "../../../components/common/DriverMap";
import { useAuth } from "../../../context/AuthContext";
import formatCurrency from "../../../utils/formatCurrency";
import { getToken } from "../../../services/api";
import useWebSocket from "../../../hooks/useWebSocket";
import "./styles.css";

const CLIENT_USER_ID = "55555555-5555-5555-5555-555555555555";
const START_DRIVER_POSITION = [-34.6083, -58.3712];

function randomNearby(position, radiusKm = 0.6) {
  const [lat, lng] = position;
  const r = Math.random() * radiusKm;
  const theta = Math.random() * 2 * Math.PI;
  const dLat = (r * Math.cos(theta)) / 111; 
  const dLng = (r * Math.sin(theta)) / (111 * Math.cos((lat * Math.PI) / 180));
  return [lat + dLat, lng + dLng];
}

function bearingDeg(from, to) {
  const lat1 = (from[0] * Math.PI) / 180;
  const lat2 = (to[0] * Math.PI) / 180;
  const dLon = ((to[1] - from[1]) * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

export default function DriverHome() {
  const { user } = useAuth();
  const { events } = useWebSocket();
  const processedEventsRef = useRef(0);

  const [earnings, setEarnings] = useState(0);
  const [showBannedModal, setShowBannedModal] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");

  const isBanned = user?.status === "BANNED";

  
  const [showModeModal, setShowModeModal] = useState(false);
  const [work, setWork] = useState({ delivery: true, ride: true });
  const [phase, setPhase] = useState("IDLE"); 
  const [searchSeconds, setSearchSeconds] = useState(0); 
  const [offer, setOffer] = useState(null); 
  const [offerCountdown, setOfferCountdown] = useState(15);
  const [simulating, setSimulating] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [tripId, setTripId] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);

  
  const [driverPos, setDriverPos] = useState(START_DRIVER_POSITION);
  const [driverHeading, setDriverHeading] = useState(0);
  const [pickupPos, setPickupPos] = useState(null);
  const [destPos, setDestPos] = useState(null);
  const [routePositions, setRoutePositions] = useState(null);
  const [routeCursor, setRouteCursor] = useState(0); 
  const [moving, setMoving] = useState(false);
  const moveTimerRef = useRef(null);
  const searchTimerRef = useRef(null);
  const offerTimerRef = useRef(null);

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
    async function snapInitial() {
      const snapped = await snapToRoad(START_DRIVER_POSITION);
      setDriverPos(snapped);
    }
    snapInitial();
    
  }, []);

  useEffect(() => {
    async function loadEarnings() {
      if (!user || user.role !== "DRIVER") return;
      try {
        const token = getToken();
        const res = await fetch("http://localhost:3333/drivers/me", {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        const data = await res.json().catch(() => null);
        if (res.ok && data) {
          setEarnings(Number(data.daily_earnings || 0));
        }
      } catch {
        
      }
    }
    if (!isBanned) loadEarnings();
  }, [user, isBanned]);

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

  useEffect(() => {
    if (!events || events.length === 0) return;
    for (let i = processedEventsRef.current; i < events.length; i++) {
      const ev = events[i];
      if (!ev) continue;
      if (ev.type === "WALLET_UPDATED" && ev.daily_earnings !== undefined && ev.daily_earnings !== null) {
        const n = Number.parseFloat(String(ev.daily_earnings));
        if (Number.isFinite(n)) setEarnings(n);
      }
    }
    processedEventsRef.current = events.length;
  }, [events]);

  function start() {
    if (isBanned) return;
    if (vehicles.length > 1) {
      setShowVehicleModal(true);
      return;
    }
    
    if (vehicles.length === 1) setSelectedVehicleId(vehicles[0].id);
    setShowModeModal(true);
  }

  function confirmVehicle() {
    if (!selectedVehicleId) return;
    setShowVehicleModal(false);
    setShowModeModal(true);
  }

  function beginSearch() {
    setShowModeModal(false);
    setOffer(null);
    setAccepting(false);
    setOfferCountdown(15);
    setPhase("SEARCHING");
    setSearchSeconds(0);
    setPickupPos(null);
    setDestPos(null);
    setRoutePositions(null);
    setRouteCursor(0);
  }

  useEffect(() => {
    if (phase !== "SEARCHING") return;
    if (searchSeconds >= 10) return;
    searchTimerRef.current = setTimeout(() => setSearchSeconds((p) => p + 1), 1000);
    return () => clearTimeout(searchTimerRef.current);
  }, [phase, searchSeconds]);

  useEffect(() => {
    if (phase !== "SEARCHING") return;
    if (searchSeconds !== 10) return;

    const allowed = [];
    if (work.ride) allowed.push("RIDE");
    if (work.delivery) allowed.push("DELIVERY");
    if (allowed.length === 0) return;

    const type = allowed[Math.floor(Math.random() * allowed.length)];
    const p = randomNearby(driverPos, 0.7);
    setOffer({ type, price: 10, pickupRaw: p });
    setPhase("CALCULATING");
  }, [phase, searchSeconds, work, driverPos]);

  useEffect(() => {
    if (phase !== "OFFER") return;
    if (offerCountdown <= 0) return;
    offerTimerRef.current = setTimeout(() => setOfferCountdown((p) => p - 1), 1000);
    return () => clearTimeout(offerTimerRef.current);
  }, [phase, offerCountdown]);

  useEffect(() => {
    if (phase !== "OFFER") return;
    if (offerCountdown !== 0) return;
    declineOffer();
    
  }, [phase, offerCountdown]);

  useEffect(() => {
    async function prepareRoute() {
      if (phase !== "CALCULATING" || !offer) return;
      if (routePositions && pickupPos && destPos) return;

      const driverOnRoad = await snapToRoad(driverPos);
      setDriverPos(driverOnRoad);

      const pickup = await snapToRoad(offer.pickupRaw);
      const dest = await snapToRoad(randomNearby(pickup, 1.2));

      const routeA = await routeByRoad(driverOnRoad, pickup);
      const routeB = await routeByRoad(pickup, dest);
      const fullRoute = [...routeA, ...routeB.slice(1)];
      setPickupPos(pickup);
      setDestPos(dest);
      setRoutePositions(fullRoute);
      setRouteCursor(0);

      setOfferCountdown(15);
      setPhase("OFFER");
    }
    prepareRoute();
    
  }, [phase, offer]);

  async function acceptOffer() {
    if (phase !== "OFFER" || !offer) return;
    if (accepting) return;
    if (!pickupPos || !destPos || !Array.isArray(routePositions) || routePositions.length < 2) return;
    try {
      setAccepting(true);

      const token = getToken();
      const res = await fetch("http://localhost:3333/trips/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          user_id: CLIENT_USER_ID,
          type: offer.type,
          price: offer.price,
          origin: "Ponto de coleta",
          destination: "Destino",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return;

      setTripId(data.id);
      setOffer(null);
      
      setPhase("IN_TRIP");
      animateDriver(routePositions);
    } catch {
      
    } finally {
      setAccepting(false);
    }
  }

  function declineOffer() {
    setOffer(null);
    setAccepting(false);
    setPhase("SEARCHING");
    setSearchSeconds(0);
    setPickupPos(null);
    setDestPos(null);
    setRoutePositions(null);
    setRouteCursor(0);
  }

  function animateDriver(points) {
    if (!Array.isArray(points) || points.length < 2) return;
    if (moveTimerRef.current) clearInterval(moveTimerRef.current);

    setMoving(true);
    setSimulating(true);
    setPhase("IN_TRIP");
    setRouteCursor(0);

    let idx = 0;
    moveTimerRef.current = setInterval(() => {
      idx += 1;
      if (idx >= points.length) {
        clearInterval(moveTimerRef.current);
        moveTimerRef.current = null;
        setMoving(false);
        setSimulating(false);
        setPhase("RATING");
        setShowRatingModal(true);
        return;
      }
      const prev = points[idx - 1];
      const next = points[idx];
      
      
      const b = bearingDeg(prev, next);
      const heading = (b + 270) % 360;
      setDriverHeading(heading);
      setDriverPos(next);
      setRouteCursor(idx); 
    }, 240); 
  }

  async function finishTrip() {
    if (!tripId) return;
    try {
      const token = getToken();
      await fetch("http://localhost:3333/trips/finish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ trip_id: tripId }),
      });
    } catch {
      
    } finally {
      setTripId(null);
      setPickupPos(null);
      setDestPos(null);
      setRoutePositions(null);
      setRouteCursor(0);
      setShowRatingModal(false);
      setRating(0);
      setPhase("IDLE");
    }
  }

  useEffect(() => {
    return () => {
      if (moveTimerRef.current) clearInterval(moveTimerRef.current);
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
      if (offerTimerRef.current) clearTimeout(offerTimerRef.current);
    };
  }, []);

  async function snapToRoad(pos) {
    try {
      const [lat, lng] = pos;
      const url = `https://router.project-osrm.org/nearest/v1/driving/${lng},${lat}?number=1`;
      const res = await fetch(url);
      const data = await res.json();
      const p = data?.waypoints?.[0]?.location;
      if (Array.isArray(p) && p.length === 2) return [p[1], p[0]];
    } catch {
      
    }
    return pos;
  }

  async function routeByRoad(from, to) {
    try {
      const [lat1, lng1] = from;
      const [lat2, lng2] = to;
      const url = `https://router.project-osrm.org/route/v1/driving/${lng1},${lat1};${lng2},${lat2}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const data = await res.json();
      const coords = data?.routes?.[0]?.geometry?.coordinates;
      if (Array.isArray(coords) && coords.length > 1) {
        return coords.map((c) => [c[1], c[0]]);
      }
    } catch {
      
    }
    
    const steps = 25;
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      pts.push([from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t]);
    }
    return pts;
  }

  return (
    <div className="driver-home">
      <div className="map-area">
        <DriverMap
          driverPosition={driverPos}
          driverHeading={driverHeading}
          pickupPosition={pickupPos || offer?.pickupRaw || null}
          destinationPosition={destPos}
          routePositions={
            Array.isArray(routePositions) && routePositions.length > 1
              ? routePositions.slice(routeCursor)
              : routePositions
          }
        />
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

      {!isBanned && phase === "IDLE" && (
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
            <button className="primary-action" onClick={() => setShowBannedModal(false)}>
              Entendi
            </button>
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

            <button className="primary-action" onClick={confirmVehicle} disabled={!selectedVehicleId}>
              Confirmar
            </button>
          </div>
        </>
      )}

      {showModeModal && (
        <>
          <div className="driver-home-modal-overlay" onClick={() => setShowModeModal(false)} />
          <div className="driver-home-modal" role="dialog" aria-modal="true">
            <button
              className="modal-x"
              type="button"
              aria-label="Fechar"
              onClick={() => setShowModeModal(false)}
            >
              ×
            </button>
            <h2>Tipo de trabalho</h2>
            <p>Escolha o que você quer fazer agora.</p>

            <div className="work-pick">
              <button
                type="button"
                className={`work-row ${work.delivery ? "active" : ""}`}
                onClick={() => setWork((p) => ({ ...p, delivery: !p.delivery }))}
              >
                <span className={`work-dot ${work.delivery ? "on" : ""}`} />
                <FiPackage className="work-icon" />
                <span className="work-label">Entregas</span>
              </button>

              <button
                type="button"
                className={`work-row ${work.ride ? "active" : ""}`}
                onClick={() => setWork((p) => ({ ...p, ride: !p.ride }))}
              >
                <span className={`work-dot ${work.ride ? "on" : ""}`} />
                <FiUsers className="work-icon" />
                <span className="work-label">Viagens</span>
              </button>
            </div>

            <button
              className="primary-action primary-action-small"
              onClick={beginSearch}
              disabled={!work.delivery && !work.ride}
            >
              Iniciar
            </button>
          </div>
        </>
      )}

      {(phase === "SEARCHING" || phase === "CALCULATING" || phase === "IN_TRIP") && !isBanned && (
        <div className="driver-home-status">
          {phase === "SEARCHING" && (
            <div className="status-pill">
              Procurando viagem… <strong>{searchSeconds}/10s</strong>
            </div>
          )}
          {phase === "CALCULATING" && (
            <div className="status-pill">Calculando melhor trajeto…</div>
          )}
          {phase === "IN_TRIP" && (
            <div className="status-pill status-pill-sim">
              Simulando viagem…
            </div>
          )}
        </div>
      )}

      {phase === "OFFER" && offer && (
        <div className="offer-bar" role="region" aria-label="Solicitação de corrida">
          <div className="offer-bar-top">
            <span>
              {offer.type === "RIDE" ? "Viagem" : "Entrega"} •{" "}
              <strong>{formatCurrency(offer.price)}</strong>
            </span>
            <span>{offerCountdown}s</span>
          </div>
          <div className="offer-bar-actions">
            <button className="decline" onClick={declineOffer} type="button" disabled={accepting}>
              Recusar
            </button>
            <button
              className="accept"
              onClick={acceptOffer}
              type="button"
              disabled={accepting || !routePositions}
            >
              {accepting ? "..." : "Aceitar"}
            </button>
          </div>
        </div>
      )}

      {showRatingModal && (
        <>
          <div className="driver-home-modal-overlay" />
          <div className="driver-home-modal" role="dialog" aria-modal="true">
            <h2>Viagem concluída</h2>
            <p>Avalie o passageiro (não será armazenado).</p>

            <div className="rating-row">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  className={`star ${rating >= n ? "on" : ""}`}
                  onClick={() => setRating(n)}
                  type="button"
                >
                  ★
                </button>
              ))}
            </div>

            <div className="rating-actions">
              <button className="primary-action" onClick={finishTrip} disabled={rating === 0}>
                Finalizar
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
