import UsersRepository from '../modules/users/repository.js';

// Middleware simples (token = userId)
export default async function authMiddleware(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : null;

    if (!token) {
      return next();
    }

    // token aqui é o próprio userId (DEV)
    const user = await UsersRepository.findById(token);
    if (!user) {
      return next();
    }

    req.user = user;
    return next();
  } catch (err) {
    return next(err);
  }
}
