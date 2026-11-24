const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../config/prisma');
const AppError = require('../../utils/AppError');

/**
 * Registra um novo usuário
 */
const registrarUsuario = async ({ name, email, password, role }) => {
  // Verificar se o usuário já existe
  const existente = await prisma.user.findUnique({ where: { email } });
  if (existente) {
    throw new AppError('Este e-mail já está cadastrado.', 409);
  }

  const senhaCriptografada = await bcrypt.hash(password, 12);

  const usuario = await prisma.user.create({
    data: {
      name,
      email,
      password: senhaCriptografada,
      role: role || 'DISPATCHER',
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return usuario;
};

/**
 * Realiza o login e retorna o token JWT
 */
const logarUsuario = async ({ email, password }) => {
  const usuario = await prisma.user.findUnique({ where: { email } });
  if (!usuario) {
    throw new AppError('E-mail ou senha inválidos.', 401);
  }

  const senhaValida = await bcrypt.compare(password, usuario.password);
  if (!senhaValida) {
    throw new AppError('E-mail ou senha inválidos.', 401);
  }

  const token = jwt.sign(
    { userId: usuario.id, role: usuario.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );

  return {
    token,
    user: {
      id: usuario.id,
      name: usuario.name,
      email: usuario.email,
      role: usuario.role,
    },
  };
};

module.exports = { registrarUsuario, logarUsuario };
