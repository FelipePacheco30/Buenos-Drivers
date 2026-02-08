export default function errorMiddleware(err, req, res, next) {
  console.error(err);

  const status = err.statusCode || 400;

  res.status(status).json({
    error: err.message || 'Erro interno',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
    }),
  });
}
