


export function isExpired(date) {
  if (!date) return false;
  return new Date(date) < new Date();
}




export function isExpiringSoon(date, days = 7) {
  if (!date) return false;

  const now = new Date();
  const limit = new Date();
  limit.setDate(now.getDate() + days);

  return new Date(date) >= now && new Date(date) <= limit;
}




export function diffInDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const diff = end - start;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}




export function formatDate(date) {
  if (!date) return null;
  return new Date(date).toISOString().split("T")[0];
}
