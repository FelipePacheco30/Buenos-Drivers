import React, { useEffect, useMemo, useRef, useState } from "react";
import { getToken } from "../../../services/api";
import formatCurrency from "../../../utils/formatCurrency";
import useWebSocket from "../../../hooks/useWebSocket";
import "./styles.css";

export default function DriverWallet() {
  const { events } = useWebSocket();
  const processedEventsRef = useRef(0);

  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [trips, setTrips] = useState([]);
  const [feePercent, setFeePercent] = useState(25);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [error, setError] = useState("");

  const canWithdraw = useMemo(() => {
    const v = Number(String(withdrawAmount).replace(",", "."));
    return Number.isFinite(v) && v > 0 && v <= balance;
  }, [withdrawAmount, balance]);

  async function load() {
    try {
      setLoading(true);
      const token = getToken();
      const res = await fetch("http://localhost:3333/driver/wallet", {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) return;
      setBalance(Number(data.wallet?.balance || 0));
      setTrips(Array.isArray(data.trips) ? data.trips : []);
      setFeePercent(Number(data.platform_fee_percent || 25));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    
  }, []);

  useEffect(() => {
    if (!events || events.length === 0) return;
    let shouldReload = false;
    for (let i = processedEventsRef.current; i < events.length; i++) {
      const ev = events[i];
      if (!ev) continue;
      if (ev.type === "WALLET_UPDATED" || ev.type === "PROFILE_UPDATED") shouldReload = true;
    }
    processedEventsRef.current = events.length;
    if (shouldReload) load();
    
  }, [events]);

  function fmtDate(dateLike) {
    if (!dateLike) return "-";
    const d = new Date(dateLike);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString();
  }

  async function withdraw() {
    setError("");
    if (!canWithdraw) return;
    try {
      setWithdrawing(true);
      const token = getToken();
      const res = await fetch("http://localhost:3333/driver/wallet/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          amount: Number(String(withdrawAmount).replace(",", ".")),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || "Erro ao sacar");
        return;
      }
      setWithdrawAmount("");
      await load();
    } finally {
      setWithdrawing(false);
    }
  }

  return (
    <div className="driver-wallet">
      <div className="wallet-header">
        <h1>Carteira</h1>
        <p>
          A Buenos Drivers cobra <strong>{feePercent}%</strong> por viagem/entrega.
          O valor é depositado já com o desconto.
        </p>
      </div>

      <div className="wallet-card">
        <div className="balance-row">
          <strong>Saldo atual</strong>
          <span>{formatCurrency(balance)}</span>
        </div>

        <div className="withdraw-row">
          <input
            placeholder="Valor para sacar (ex: 25)"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
          />
          <button onClick={withdraw} disabled={!canWithdraw || withdrawing}>
            {withdrawing ? "..." : "Sacar"}
          </button>
        </div>

        {error && <div className="error">{error}</div>}
      </div>

      <div className="wallet-card">
        <strong>Histórico recente</strong>
        {loading && <div className="muted" style={{ marginTop: 10 }}>Carregando…</div>}
        {!loading && trips.length === 0 && (
          <div className="muted" style={{ marginTop: 10 }}>
            Nenhuma corrida ainda.
          </div>
        )}

        <div className="trip-list">
          {trips.map((t) => (
            <div key={t.id} className="trip-row">
              <div className="trip-top">
                <strong>{t.type === "DELIVERY" ? "Entrega" : "Viagem"}</strong>
                <span className="date">{fmtDate(t.completed_at || t.created_at)}</span>
              </div>
              <div className="trip-bottom">
                <span className="muted">Bruto: {formatCurrency(Number(t.gross_amount || t.price || 0))}</span>
                <span className="muted">Líquido: {formatCurrency(Number(t.net_amount || 0))}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
