export default function roleMiddleware(requiredRole) {
  return (req, res, next) => {
    const { role, status } = req.user;

    if (role !== requiredRole) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    if (status === 'BANNED') {
      return res.status(403).json({
        error: 'Conta banida. Acesso restrito à caixa de entrada.',
      });
    }

    return next();
  };
}
