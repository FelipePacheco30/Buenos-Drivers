import React, { useEffect, useMemo, useRef, useState } from "react";
import { getToken } from "../../../services/api";
import useWebSocket from "../../../hooks/useWebSocket";
import "./styles.css";

function onlyDigits(s) {
  return String(s || "").replace(/\D/g, "");
}

function sanitizeISODateInput(value) {
  // valor esperado: YYYY-MM-DD
  const v = String(value || "");
  if (!v) return "";
  const cut = v.slice(0, 10);
  // permite somente se estiver no formato completo (evita ano > 4 dígitos)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(cut)) return "";
  return cut;
}

function isISODate(dateStr) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateStr || ""))) return false;
  const d = new Date(`${dateStr}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return false;
  const [y, m, day] = String(dateStr).split("-").map((n) => Number(n));
  return (
    d.getUTCFullYear() === y &&
    d.getUTCMonth() === m - 1 &&
    d.getUTCDate() === day
  );
}

function normalizePlate(input) {
  return String(input || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 7);
}

function isValidPlate(plate) {
  // padrão: AB123CD (7 chars, letras e números)
  return /^[A-Z]{2}\d{3}[A-Z]{2}$/.test(String(plate || ""));
}

function fmtDocName(doc) {
  const t = String(doc.type || "");
  if (t === "CRLV") {
    const plate = doc.vehicle_plate ? ` (${doc.vehicle_plate})` : "";
    return `CRLV${plate}`;
  }
  if (t === "CRIMINAL_RECORD") return "Histórico criminal";
  return t;
}

export default function DriverRenewals() {
  const { events } = useWebSocket();
  const processedEventsRef = useRef(0);
  const [loading, setLoading] = useState(true);
  const [docs, setDocs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [submittedOnce, setSubmittedOnce] = useState(false);

  // inputs por documento (key: doc.id)
  const [form, setForm] = useState({});
  const [touchedDocs, setTouchedDocs] = useState({});

  const canAddVehicle = useMemo(() => vehicles.length <= 1, [vehicles.length]);
  const [vehicleAdd, setVehicleAdd] = useState({
    plate: "",
    brand: "",
    kind: "CAR",
    model: "",
    year: "",
    color: "",
    crlv_issued_at: "",
    crlv_expires_at: "",
  });
  const [touchedVehicle, setTouchedVehicle] = useState({});

  async function load() {
    try {
      setLoading(true);
      setError("");
      const token = getToken();

      const [docsRes, vehRes] = await Promise.all([
        fetch("http://localhost:3333/documents", {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        }),
        fetch("http://localhost:3333/vehicles", {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        }),
      ]);

      const docsData = await docsRes.json().catch(() => []);
      const vehData = await vehRes.json().catch(() => []);

      setDocs(docsRes.ok && Array.isArray(docsData) ? docsData : []);
      setVehicles(vehRes.ok && Array.isArray(vehData) ? vehData : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!events || events.length === 0) return;
    let shouldReload = false;
    for (let i = processedEventsRef.current; i < events.length; i++) {
      const ev = events[i];
      if (!ev) continue;
      if (ev.type === "RENEWAL_APPROVED") shouldReload = true;
    }
    processedEventsRef.current = events.length;
    if (shouldReload) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events]);

  const docsToRenew = useMemo(() => {
    return (docs || []).filter((d) => d.status === "EXPIRING" || d.status === "EXPIRED");
  }, [docs]);

  const currentYear = new Date().getFullYear();
  const todayISO = new Date().toISOString().slice(0, 10);

  function markDocTouched(docId, field) {
    setTouchedDocs((prev) => ({
      ...prev,
      [docId]: { ...(prev[docId] || {}), [field]: true },
    }));
  }

  function markVehicleTouched(field) {
    setTouchedVehicle((prev) => ({ ...prev, [field]: true }));
  }

  function docFieldInvalid({ eligible, field, issuedIso, expiresIso, touched }) {
    if (!eligible) return false;

    const show = submittedOnce || touched;
    if (!show) return false;

    if (field === "issued_at") {
      if (!issuedIso) return true;
      if (!isISODate(issuedIso)) return true;
      const issuedYear = Number(issuedIso.slice(0, 4));
      if (issuedYear > currentYear) return true;
      if (issuedIso > todayISO) return true;
      if (expiresIso && isISODate(expiresIso) && expiresIso < issuedIso) return true;
      return false;
    }

    if (field === "expires_at") {
      if (!expiresIso) return true;
      if (!isISODate(expiresIso)) return true;
      if (issuedIso && isISODate(issuedIso) && expiresIso < issuedIso) return true;
      return false;
    }

    return false;
  }

  const vehicleCandidate = useMemo(() => {
    const v = vehicleAdd;
    return (
      !!String(v.kind || "").trim() ||
      !!String(v.model || "").trim() ||
      !!String(v.brand || "").trim() ||
      !!String(v.year || "").trim() ||
      !!String(v.color || "").trim() ||
      !!String(v.plate || "").trim() ||
      !!String(v.crlv_issued_at || "").trim() ||
      !!String(v.crlv_expires_at || "").trim()
    );
  }, [vehicleAdd]);

  function vehicleInvalid(field) {
    if (!canAddVehicle) return false;
    if (!vehicleCandidate) return false;
    const show = submittedOnce || !!touchedVehicle[field];
    if (!show) return false;

    const kind = String(vehicleAdd.kind || "").trim().toUpperCase();
    const model = String(vehicleAdd.model || "").trim();
    const brand = String(vehicleAdd.brand || "").trim();
    const color = String(vehicleAdd.color || "").trim();
    const plate = normalizePlate(vehicleAdd.plate);
    const yearDigits = onlyDigits(vehicleAdd.year).slice(0, 4);
    const yearNum = Number(yearDigits);
    const crlvIssued = String(vehicleAdd.crlv_issued_at || "").trim();
    const crlvExpires = String(vehicleAdd.crlv_expires_at || "").trim();

    if (field === "kind") return !(kind === "CAR" || kind === "MOTO");
    if (field === "model") return !model;
    if (field === "brand") return !brand;
    if (field === "color") return !color;
    if (field === "plate") {
      if (!plate) return true;
      // só acusa inválida quando tiver 7 chars ou no submit
      if (plate.length < 7 && !submittedOnce) return false;
      return !isValidPlate(plate);
    }
    if (field === "year") {
      if (yearDigits.length !== 4) return true;
      if (!Number.isFinite(yearNum)) return true;
      if (yearNum < 1900 || yearNum > currentYear + 1) return true;
      return false;
    }
    if (field === "crlv_issued_at") {
      if (!crlvIssued) return true;
      if (!isISODate(crlvIssued)) return true;
      if (crlvIssued > todayISO) return true;
      if (crlvExpires && isISODate(crlvExpires) && crlvExpires < crlvIssued) return true;
      return false;
    }
    if (field === "crlv_expires_at") {
      if (!crlvExpires) return true;
      if (!isISODate(crlvExpires)) return true;
      if (crlvIssued && isISODate(crlvIssued) && crlvExpires < crlvIssued) return true;
      return false;
    }
    return false;
  }

  async function submit() {
    setError("");
    setOk("");
    setSubmittedOnce(true);

    const documents = docsToRenew
      .map((d) => {
        const f = form[d.id] || {};
        const issuedIso = String(f.issued_at || "").trim();
        const expiresIso = String(f.expires_at || "").trim();
        if (!issuedIso || !expiresIso) return null;

        if (!isISODate(issuedIso) || !isISODate(expiresIso)) throw new Error("DATA_INVALIDA");
        const issuedYear = Number(issuedIso.slice(0, 4));
        if (issuedYear > currentYear) throw new Error("EMISSAO_ANO_FUTURO");
        if (issuedIso > todayISO) throw new Error("EMISSAO_ANO_FUTURO");
        if (expiresIso < issuedIso) throw new Error("VENCIMENTO_ANTES_EMISSAO");

        return {
          type: d.type,
          vehicle_id: d.vehicle_id || null,
          issued_at: issuedIso,
          expires_at: expiresIso,
        };
      })
      .filter(Boolean);

    const normalizedPlate = normalizePlate(vehicleAdd.plate);
    const yearDigits = onlyDigits(vehicleAdd.year).slice(0, 4);

    const includeVehicle =
      canAddVehicle &&
      normalizedPlate &&
      isValidPlate(normalizedPlate) &&
      String(vehicleAdd.kind || "").trim() &&
      vehicleAdd.model.trim() &&
      vehicleAdd.brand.trim() &&
      yearDigits.length === 4 &&
      vehicleAdd.color.trim() &&
      vehicleAdd.crlv_issued_at &&
      vehicleAdd.crlv_expires_at;

    if (documents.length === 0 && !includeVehicle) {
      setError("Preencha ao menos um documento (vencido/expirando) ou adicione um veículo.");
      return;
    }

    try {
      setSubmitting(true);
      const token = getToken();

      let vehiclePayload = null;
      if (includeVehicle) {
        const crlvIssuedIso = String(vehicleAdd.crlv_issued_at || "").trim();
        const crlvExpiresIso = String(vehicleAdd.crlv_expires_at || "").trim();
        if (!isISODate(crlvIssuedIso) || !isISODate(crlvExpiresIso)) throw new Error("DATA_INVALIDA");
        const crlvIssuedYear = Number(crlvIssuedIso.slice(0, 4));
        if (crlvIssuedYear > currentYear) throw new Error("EMISSAO_ANO_FUTURO");
        if (crlvIssuedIso > todayISO) throw new Error("EMISSAO_ANO_FUTURO");
        if (crlvExpiresIso < crlvIssuedIso) throw new Error("VENCIMENTO_ANTES_EMISSAO");

        const yearNum = Number(yearDigits);
        if (!Number.isFinite(yearNum) || yearNum < 1900 || yearNum > currentYear + 1) {
          throw new Error("ANO_INVALIDO");
        }

        vehiclePayload = {
          plate: normalizedPlate,
          brand: vehicleAdd.brand.trim(),
          kind: String(vehicleAdd.kind || "CAR").trim(),
          model: vehicleAdd.model.trim(),
          year: yearNum,
          color: vehicleAdd.color.trim(),
          crlv_issued_at: crlvIssuedIso,
          crlv_expires_at: crlvExpiresIso,
        };
      }

      const res = await fetch("http://localhost:3333/driver/renewals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          documents,
          vehicle_add: vehiclePayload,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || "Erro ao enviar solicitação");
        return;
      }

      setOk("Solicitação enviada para análise do administrador.");
      setForm({});
      setVehicleAdd({
        plate: "",
        brand: "",
        kind: "CAR",
        model: "",
        year: "",
        color: "",
        crlv_issued_at: "",
        crlv_expires_at: "",
      });
    } catch (e) {
      if (e?.message === "DATA_INVALIDA") {
        setError("Datas inválidas.");
        return;
      }
      if (e?.message === "EMISSAO_ANO_FUTURO") {
        setError("A data de emissão não pode ser no futuro.");
        return;
      }
      if (e?.message === "VENCIMENTO_ANTES_EMISSAO") {
        setError("A data de vencimento não pode ser anterior à emissão.");
        return;
      }
      if (e?.message === "ANO_INVALIDO") {
        setError("Ano do veículo inválido (use 4 dígitos).");
        return;
      }
      throw e;
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="driver-renewals">
      <div className="driver-renewals-header">
        <h1>Enviar documentos</h1>
        <p>
          Você só pode enviar atualização para documentos <strong>vencidos</strong> ou{" "}
          <strong>próximos do vencimento</strong>. O pedido será analisado em{" "}
          <strong>Renovações</strong> pelo admin.
        </p>
      </div>

      {loading && <div className="state">Carregando…</div>}

      {!loading && (
        <>
          <div className="card">
            <h2>Documentos pendentes</h2>

            {docs.length === 0 && <div className="state">Nenhum documento encontrado.</div>}

            {docs.map((d) => {
              const key = d.id;
              const f = form[key] || {};
              const eligible = d.status === "EXPIRING" || d.status === "EXPIRED";
              const touched = touchedDocs[key] || {};
              return (
                <div key={d.id} className={`row ${eligible ? "" : "disabled"}`}>
                  <div className="row-title">
                    <strong>{fmtDocName(d)}</strong>
                    <span
                      className={`pill ${
                        d.status === "EXPIRED"
                          ? "danger"
                          : d.status === "EXPIRING"
                            ? "warning"
                            : "success"
                      }`}
                    >
                      {d.status === "EXPIRED"
                        ? "Vencido"
                        : d.status === "EXPIRING"
                          ? "Próximo"
                          : "Em dia"}
                    </span>
                  </div>

                  <div className="row-fields">
                    <label>
                      Emissão
                      <input
                        type="date"
                        value={f.issued_at || ""}
                        disabled={!eligible}
                        className={
                          docFieldInvalid({
                            eligible,
                            field: "issued_at",
                            issuedIso: f.issued_at || "",
                            expiresIso: f.expires_at || "",
                            touched: !!touched.issued_at,
                          })
                            ? "invalid"
                            : ""
                        }
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            [key]: {
                              ...(p[key] || {}),
                              issued_at: sanitizeISODateInput(e.target.value),
                            },
                          }))
                        }
                        onBlur={() => markDocTouched(key, "issued_at")}
                      />
                    </label>
                    <label>
                      Vencimento
                      <input
                        type="date"
                        value={f.expires_at || ""}
                        disabled={!eligible}
                        className={
                          docFieldInvalid({
                            eligible,
                            field: "expires_at",
                            issuedIso: f.issued_at || "",
                            expiresIso: f.expires_at || "",
                            touched: !!touched.expires_at,
                          })
                            ? "invalid"
                            : ""
                        }
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            [key]: {
                              ...(p[key] || {}),
                              expires_at: sanitizeISODateInput(e.target.value),
                            },
                          }))
                        }
                        onBlur={() => markDocTouched(key, "expires_at")}
                      />
                    </label>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="card">
            <h2>Adicionar veículo</h2>
            {!canAddVehicle && (
              <div className="state">Limite de 2 veículos já atingido.</div>
            )}

            {canAddVehicle && (
              <div className="row">
                <div className="row-fields grid2">
                  <label>
                    Tipo
                    <select
                      value={vehicleAdd.kind}
                      className={vehicleInvalid("kind") ? "invalid" : ""}
                      onChange={(e) =>
                        setVehicleAdd((p) => ({ ...p, kind: e.target.value }))
                      }
                      onBlur={() => markVehicleTouched("kind")}
                    >
                      <option value="CAR">Carro</option>
                      <option value="MOTO">Moto</option>
                    </select>
                  </label>
                  <label>
                    Modelo
                    <input
                      value={vehicleAdd.model}
                      className={vehicleInvalid("model") ? "invalid" : ""}
                      onChange={(e) =>
                        setVehicleAdd((p) => ({ ...p, model: e.target.value }))
                      }
                      onBlur={() => markVehicleTouched("model")}
                      placeholder="Ex: Onix"
                    />
                  </label>
                  <label>
                    Cor
                    <input
                      value={vehicleAdd.color}
                      className={vehicleInvalid("color") ? "invalid" : ""}
                      onChange={(e) =>
                        setVehicleAdd((p) => ({ ...p, color: e.target.value }))
                      }
                      onBlur={() => markVehicleTouched("color")}
                      placeholder="Ex: Preto"
                    />
                  </label>
                  <label>
                    Ano
                    <input
                      value={vehicleAdd.year}
                      className={vehicleInvalid("year") ? "invalid" : ""}
                      onChange={(e) =>
                        setVehicleAdd((p) => ({
                          ...p,
                          year: onlyDigits(e.target.value).slice(0, 4),
                        }))
                      }
                      onBlur={() => markVehicleTouched("year")}
                      placeholder="Ex: 2021"
                      inputMode="numeric"
                      maxLength={4}
                    />
                  </label>
                  <label>
                    Placa
                    <input
                      value={vehicleAdd.plate}
                      className={vehicleInvalid("plate") ? "invalid" : ""}
                      onChange={(e) =>
                        setVehicleAdd((p) => ({
                          ...p,
                          plate: normalizePlate(e.target.value),
                        }))
                      }
                      onBlur={() => markVehicleTouched("plate")}
                      placeholder="AB123CD"
                      maxLength={7}
                    />
                  </label>
                  <label>
                    Marca
                    <input
                      value={vehicleAdd.brand}
                      className={vehicleInvalid("brand") ? "invalid" : ""}
                      onChange={(e) =>
                        setVehicleAdd((p) => ({ ...p, brand: e.target.value }))
                      }
                      onBlur={() => markVehicleTouched("brand")}
                      placeholder="Ex: Chevrolet"
                    />
                  </label>
                  <div />
                  <label>
                    CRLV - Emissão
                    <input
                      type="date"
                      value={vehicleAdd.crlv_issued_at}
                      className={vehicleInvalid("crlv_issued_at") ? "invalid" : ""}
                      onChange={(e) =>
                        setVehicleAdd((p) => ({
                          ...p,
                          crlv_issued_at: sanitizeISODateInput(e.target.value),
                        }))
                      }
                      onBlur={() => markVehicleTouched("crlv_issued_at")}
                    />
                  </label>
                  <label>
                    CRLV - Vencimento
                    <input
                      type="date"
                      value={vehicleAdd.crlv_expires_at}
                      className={vehicleInvalid("crlv_expires_at") ? "invalid" : ""}
                      onChange={(e) =>
                        setVehicleAdd((p) => ({
                          ...p,
                          crlv_expires_at: sanitizeISODateInput(e.target.value),
                        }))
                      }
                      onBlur={() => markVehicleTouched("crlv_expires_at")}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          {error && <div className="alert danger">{error}</div>}
          {ok && <div className="alert success">{ok}</div>}

          <button className="submit" onClick={submit} disabled={submitting}>
            {submitting ? "Enviando…" : "Enviar solicitação"}
          </button>
        </>
      )}
    </div>
  );
}

