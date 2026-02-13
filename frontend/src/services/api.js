

const BASE_URL = "http://localhost:3333";

let token = null;


export function setToken(t) {
  token = t;
  
  sessionStorage.setItem("token", t);
  
  localStorage.removeItem("token");
}

export function getToken() {
  if (!token) token = sessionStorage.getItem("token") || localStorage.getItem("token");
  return token;
}

export function logout() {
  token = null;
  sessionStorage.removeItem("token");
  localStorage.removeItem("token"); 
}









export async function login(email, password, role) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role }),
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.message || "Erro ao fazer login");

  
  setToken(data.token);

  
  sessionStorage.setItem("user", JSON.stringify(data.user));
  
  localStorage.removeItem("user");

  return data;
}


async function fetchWithAuth(url, options = {}) {
  const headers = options.headers || {};
  const t = getToken();
  if (t) headers["Authorization"] = `Bearer ${t}`;

  const res = await fetch(`${BASE_URL}${url}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) throw new Error(data.message || "Erro na requisição");

  return data;
}


export async function getUsers() {
  return fetchWithAuth("/users");
}

export async function getDriverEarnings() {
  return fetchWithAuth("/driver/earnings");
}

export async function getAdminDashboard() {
  return fetchWithAuth("/admin/dashboard");
}
