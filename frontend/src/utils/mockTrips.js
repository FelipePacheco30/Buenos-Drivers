






export default function mockTrips(count = 10) {
  const statuses = ["COMPLETED", "CANCELED", "PENDING"];
  const trips = [];

  for (let i = 0; i < count; i++) {
    trips.push({
      id: `trip-${i + 1}`,
      value: parseFloat((Math.random() * 100).toFixed(2)),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      date: new Date(
        Date.now() - Math.floor(Math.random() * 100000000)
      ).toISOString(),
      passenger: `Passenger ${i + 1}`,
      origin: `Origin ${i + 1}`,
      destination: `Destination ${i + 1}`,
    });
  }

  return trips;
}
