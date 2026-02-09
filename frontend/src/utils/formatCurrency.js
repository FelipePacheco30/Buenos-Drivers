// utils/formatCurrency.js

/**
 * Formata um valor numérico em moeda brasileira (R$)
 * @param {number} value
 * @returns {string}
 */
export default function formatCurrency(value) {
  if (typeof value !== "number") return "R$ 0,00";

  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
