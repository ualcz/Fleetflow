const catchAsync = require('../../utils/catchAsync');
const { sendSuccess } = require('../../utils/response');
const { driverSchema, driverUpdateSchema } = require('../../validators/schemas');
const { criarMotorista, listarMotoristas, buscarMotoristaPorId, atualizarMotorista } = require('./driver.service');

const criar = catchAsync(async (req, res) => {
  const validado = driverSchema.parse(req.body);
  const motorista = await criarMotorista(validado);
  sendSuccess(res, 201, 'Motorista cadastrado com sucesso.', { driver: motorista });
});

const listar = catchAsync(async (req, res) => {
  const motoristas = await listarMotoristas();
  sendSuccess(res, 200, 'Motoristas listados com sucesso.', { drivers: motoristas });
});

const buscar = catchAsync(async (req, res) => {
  const motorista = await buscarMotoristaPorId(Number(req.params.id));
  sendSuccess(res, 200, 'Motorista encontrado com sucesso.', { driver: motorista });
});

const atualizar = catchAsync(async (req, res) => {
  const validado = driverUpdateSchema.parse(req.body);
  const motorista = await atualizarMotorista(Number(req.params.id), validado);
  sendSuccess(res, 200, 'Motorista atualizado com sucesso.', { driver: motorista });
});

module.exports = { criar, listar, buscar, atualizar };
