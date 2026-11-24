const catchAsync = require('../../utils/catchAsync');
const { sendSuccess } = require('../../utils/response');
const { registrarUsuario, logarUsuario } = require('./auth.service');
const { registerSchema, loginSchema } = require('../../validators/schemas');

const registrar = catchAsync(async (req, res) => {
  const validado = registerSchema.parse(req.body);
  const usuario = await registrarUsuario(validado);
  sendSuccess(res, 201, 'Usuário cadastrado com sucesso.', { user: usuario });
});

const login = catchAsync(async (req, res) => {
  const validado = loginSchema.parse(req.body);
  const resultado = await logarUsuario(validado);
  sendSuccess(res, 200, 'Login realizado com sucesso.', resultado);
});

module.exports = { registrar, login };
