function safeJsonParse(raw) {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isPreviewMode() {
  return sessionStorage.getItem("preview_mode") === "1";
}

export function getPreviewWallet() {
  const raw = sessionStorage.getItem("preview_wallet");
  const data = safeJsonParse(raw);
  if (data && typeof data === "object") return data;
  const fresh = {
    balance: 52.35,
    fee_percent: 25,
    trips: [
      {
        id: "pv-trip-1",
        type: "RIDE",
        price_gross: 10,
        fee_percent: 25,
        price_net: 7.5,
        completed_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      },
    ],
  };
  sessionStorage.setItem("preview_wallet", JSON.stringify(fresh));
  return fresh;
}

export function addPreviewTrip({ type, priceGross }) {
  const w = getPreviewWallet();
  const feePercent = Number(w.fee_percent ?? 25);
  const gross = Number(priceGross || 0);
  const net = Math.max(0, gross * (1 - feePercent / 100));

  const trip = {
    id: `pv-trip-${Date.now()}`,
    type,
    price_gross: gross,
    fee_percent: feePercent,
    price_net: Number(net.toFixed(2)),
    completed_at: new Date().toISOString(),
  };

  const next = {
    ...w,
    balance: Number((Number(w.balance || 0) + trip.price_net).toFixed(2)),
    trips: [trip, ...(Array.isArray(w.trips) ? w.trips : [])].slice(0, 5),
  };
  sessionStorage.setItem("preview_wallet", JSON.stringify(next));
  return next;
}

export function getPreviewDriverVehicles() {
  return [
    {
      id: "pv-veh-1",
      kind: "CAR",
      plate: "PV123AB",
      brand: "Chevrolet",
      model: "Onix",
      year: 2021,
      color: "Branco",
    },
    {
      id: "pv-veh-2",
      kind: "MOTO",
      plate: "PV456CD",
      brand: "Honda",
      model: "CG 160",
      year: 2022,
      color: "Preto",
    },
  ];
}

export function getPreviewDriverDocuments() {
  const now = new Date();
  const plusDays = (n) => new Date(now.getTime() + n * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const minusDays = (n) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  return [
    { id: "pv-doc-1", type: "CNH", issued_at: minusDays(500), expires_at: plusDays(20), status: "VALID" },
    {
      id: "pv-doc-2",
      type: "CRLV",
      vehicle_id: "pv-veh-1",
      vehicle_plate: "PV123AB",
      issued_at: minusDays(200),
      expires_at: plusDays(5),
      status: "EXPIRING",
    },
    {
      id: "pv-doc-3",
      type: "CRIMINAL_RECORD",
      issued_at: minusDays(300),
      expires_at: plusDays(60),
      status: "VALID",
    },
  ];
}

export function getPreviewNegativeReviews() {
  return [
    { id: "pv-rev-1", reason: "Atraso na chegada ao ponto de coleta.", created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
    { id: "pv-rev-2", reason: "Comunicação pouco clara durante a corrida.", created_at: new Date(Date.now() - 86400000 * 12).toISOString() },
  ];
}

export function getPreviewThread() {
  return [
    {
      id: "pv-msg-1",
      driver_id: "pv-driver",
      sender_role: "SYSTEM",
      system_event: "REPUTATION_WARNING",
      body: "Assunto: Atenção: sua reputação está abaixo do esperado\n\nOlá Motorista Preview, tudo bem?\n\nEsta é uma conversa de demonstração (Preview).",
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      read_by_admin_at: null,
      read_by_driver_at: null,
    },
    {
      id: "pv-msg-2",
      driver_id: "pv-driver",
      sender_role: "ADMIN",
      system_event: null,
      body: "Olá! Se precisar de ajuda, estamos por aqui. (Preview)",
      created_at: new Date(Date.now() - 86400000 * 2 + 1000 * 60 * 12).toISOString(),
      read_by_admin_at: null,
      read_by_driver_at: null,
    },
    {
      id: "pv-msg-3",
      driver_id: "pv-driver",
      sender_role: "DRIVER",
      system_event: null,
      body: "Entendi! Obrigado. (Preview)",
      created_at: new Date(Date.now() - 86400000 * 2 + 1000 * 60 * 15).toISOString(),
      read_by_admin_at: null,
      read_by_driver_at: null,
    },
  ];
}

export function getPreviewAdminDrivers() {
  return [
    {
      driver_id: "pv-driver-1",
      user_id: "pv-user-1",
      name: "Motorista Preview",
      email: "driver.preview@buenos.local",
      user_status: "IRREGULAR",
      reputation_score: 4.4,
      documents_overall_status: "EXPIRING",
      total_trips: 32,
      vehicles_count: 2,
    },
    {
      driver_id: "pv-driver-2",
      user_id: "pv-user-2",
      name: "Paula Herrera",
      email: "paula.herrera@buenos.local",
      user_status: "ACTIVE",
      reputation_score: 4.8,
      documents_overall_status: "VALID",
      total_trips: 85,
      vehicles_count: 1,
    },
  ];
}

export function getPreviewAdminConversations() {
  return [
    {
      driver_id: "pv-driver-1",
      user_id: "pv-user-1",
      name: "Motorista Preview",
      email: "driver.preview@buenos.local",
      user_status: "IRREGULAR",
      documents_overall_status: "EXPIRING",
      last_message: "Entendi! Obrigado. (Preview)",
      last_sender_role: "DRIVER",
      last_system_event: null,
      last_message_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    },
  ];
}

export function getPreviewAdminThread() {
  return getPreviewThread().map((m) => ({
    ...m,
    driver_id: "pv-driver-1",
  }));
}

