// services/api.js

const BASE_URL = "http://localhost:3333";

let token = null;

// -------------------- TOKEN --------------------
export function setToken(t) {
  token = t;
  // sessionStorage = por aba (permite admin + driver em abas diferentes)
  sessionStorage.setItem("token", t);
  // evita “vazamento” entre abas antigas que ainda leem localStorage
  localStorage.removeItem("token");
}

export function getToken() {
  if (!token) token = sessionStorage.getItem("token") || localStorage.getItem("token");
  return token;
}

export function logout() {
  token = null;
  sessionStorage.removeItem("token");
  localStorage.removeItem("token"); // compat (sessões antigas)
}

// -------------------- LOGIN --------------------
/**
 * Faz login de usuário
 * @param {string} email
 * @param {string} password
 * @param {string} role
 * @returns {Promise<Object>} Dados do usuário logado
 */
export async function login(email, password, role) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role }),
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.message || "Erro ao fazer login");

  // salva token automaticamente
  setToken(data.token);

  // também salva usuário por aba
  sessionStorage.setItem("user", JSON.stringify(data.user));
  // evita “vazamento” entre abas antigas que ainda leem localStorage
  localStorage.removeItem("user");

  return data;
}

// -------------------- REQUISIÇÕES COM TOKEN --------------------
async function fetchWithAuth(url, options = {}) {
  const headers = options.headers || {};
  const t = getToken();
  if (t) headers["Authorization"] = `Bearer ${t}`;

  const res = await fetch(`${BASE_URL}${url}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) throw new Error(data.message || "Erro na requisição");

  return data;
}

// -------------------- EXEMPLOS DE SERVIÇOS --------------------
export async function getUsers() {
  return fetchWithAuth("/users");
}

export async function getDriverEarnings() {
  return fetchWithAuth("/driver/earnings");
}

export async function getAdminDashboard() {
  return fetchWithAuth("/admin/dashboard");
}
