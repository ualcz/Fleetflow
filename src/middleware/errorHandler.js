const AppError = require('../utils/AppError');
const { sendError } = require('../utils/response');

/**
 * Trata erros conhecidos do Prisma (ex: violação de unicidade)
 */
const tratarErroPrisma = (err) => {
  if (err.code === 'P2002') {
    const campo = err.meta?.target?.[0] || 'campo';
    return new AppError(`Valor duplicado: ${campo} já existe.`, 400);
  }
  if (err.code === 'P2025') {
    return new AppError('Registro não encontrado.', 404);
  }
  if (err.code === 'P2003') {
    return new AppError('Violação de chave estrangeira. O registro referenciado não existe.', 400);
  }
  return new AppError('Erro de banco de dados.', 500);
};

/**
 * Trata erros de JWT
 */
const tratarErroJWT = () => new AppError('Token inválido. Faça login novamente.', 401);
const tratarErroJWTExpirado = () => new AppError('Token expirado. Faça login novamente.', 401);

/**
 * Middleware global de tratamento de erros
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Erros do Prisma
  if (err.constructor?.name === 'PrismaClientKnownRequestError') {
    error = tratarErroPrisma(err);
  }

  // Erros de JWT
  if (err.name === 'JsonWebTokenError') error = tratarErroJWT();
  if (err.name === 'TokenExpiredError') error = tratarErroJWTExpirado();

  // Erros de validação do Zod
  if (err.name === 'ZodError') {
    const erros = err.errors.map((e) => ({
      campo: e.path.join('.'),
      mensagem: e.message,
    }));
    return sendError(res, 400, 'Falha na validação', erros);
  }

  // Desenvolvimento: exibir erro completo
  if (process.env.NODE_ENV === 'development') {
    console.error('ERRO:', err);
  }

  // Erros operacionais: enviar ao cliente
  if (error.isOperational) {
    return sendError(res, error.statusCode, error.message);
  }

  // Erros de programação/desconhecidos: mensagem genérica
  console.error('ERRO NÃO TRATADO:', err);
  return sendError(res, 500, 'Algo deu errado no servidor.');
};

module.exports = errorHandler;
