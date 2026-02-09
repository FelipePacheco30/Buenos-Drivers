// Middleware simples (SEM JWT, SEM HASH)
export default function authMiddleware(req, res, next) {
  // Por enquanto não bloqueia nada
  // Depois você pode evoluir isso
  return next();
}
