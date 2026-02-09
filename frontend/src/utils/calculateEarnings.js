// utils/calculateEarnings.js

/**
 * Calcula ganhos do motorista a partir de uma lista de corridas
 * @param {Array} trips Array de objetos { value: number, status: string }
 * @returns {number} Total de ganhos líquidos
 */
export default function calculateEarnings(trips = []) {
  if (!Array.isArray(trips)) return 0;

  return trips
    .filter((trip) => trip.status === "COMPLETED")
    .reduce((total, trip) => total + (trip.value || 0), 0);
}
