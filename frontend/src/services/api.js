// services/api.js

const BASE_URL = "http://localhost:3333";

/**
 * Faz login de usuário
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>} Dados do usuário logado
 */
export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    // lança um erro com a mensagem da API
    throw new Error(data.message || "Erro ao fazer login");
  }

  return data;
}

/**
 * Exemplo: buscar usuários (ou outras rotas protegidas)
 * @param {string} token JWT opcional
 */
export async function getUsers(token) {
  const res = await fetch(`${BASE_URL}/users`, {
    headers: token
      ? { Authorization: `Bearer ${token}` }
      : {},
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erro ao buscar usuários");
  return data;
}
