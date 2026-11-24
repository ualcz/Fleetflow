const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

/**
 * Middleware: Verifica o token JWT do cabeçalho Authorization
 */
const autenticarToken = catchAsync(async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null;

  if (!token) {
    return next(new AppError('Acesso negado. Nenhum token fornecido.', 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded; // { userId, role }
  next();
});

/**
 * Middleware: Restringe acesso a perfis específicos
 * @param {...string} roles - Perfis permitidos
 */
const autorizarPerfis = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Acesso negado. Requer um dos seguintes perfis: ${roles.join(', ')}`,
          403
        )
      );
    }
    next();
  };
};

module.exports = { autenticarToken, autorizarPerfis };
