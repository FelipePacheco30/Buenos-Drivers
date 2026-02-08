/**
 * Retorna true se a data estiver expirada
 */
export function isExpired(date) {
  if (!date) return false;
  return new Date(date) < new Date();
}

/**
 * Retorna true se a data vence em até X dias
 */
export function isExpiringSoon(date, days = 7) {
  if (!date) return false;

  const now = new Date();
  const limit = new Date();
  limit.setDate(now.getDate() + days);

  return new Date(date) >= now && new Date(date) <= limit;
}

/**
 * Diferença em dias entre duas datas
 */
export function diffInDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const diff = end - start;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Formata data para ISO (YYYY-MM-DD)
 */
export function formatDate(date) {
  if (!date) return null;
  return new Date(date).toISOString().split("T")[0];
}
