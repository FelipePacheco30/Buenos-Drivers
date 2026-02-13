






export default function calculateEarnings(trips = []) {
  if (!Array.isArray(trips)) return 0;

  return trips
    .filter((trip) => trip.status === "COMPLETED")
    .reduce((total, trip) => total + (trip.value || 0), 0);
}
