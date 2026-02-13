


export function calculateNetEarning(grossValue, platformFeePercent = 20) {
  const fee = (grossValue * platformFeePercent) / 100;
  return Number((grossValue - fee).toFixed(2));
}




export function sumEarnings(trips = []) {
  return trips.reduce((total, trip) => {
    return total + Number(trip.net_amount || 0);
  }, 0);
}




export function earningsStats(trips = []) {
  const totalGross = trips.reduce(
    (sum, trip) => sum + Number(trip.gross_amount || 0),
    0
  );

  const totalNet = trips.reduce(
    (sum, trip) => sum + Number(trip.net_amount || 0),
    0
  );

  return {
    totalTrips: trips.length,
    totalGross: Number(totalGross.toFixed(2)),
    totalNet: Number(totalNet.toFixed(2))
  };
}
