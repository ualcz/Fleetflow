const catchAsync = require('../../utils/catchAsync');
const { sendSuccess } = require('../../utils/response');
const { vehicleSchema, vehicleUpdateSchema } = require('../../validators/schemas');
const {
  criarVeiculo,
  listarVeiculos,
  buscarVeiculoPorId,
  atualizarVeiculo,
  removerVeiculo,
} = require('./vehicle.service');

const criar = catchAsync(async (req, res) => {
  const validado = vehicleSchema.parse(req.body);
  const veiculo = await criarVeiculo(validado);
  sendSuccess(res, 201, 'Veículo cadastrado com sucesso.', { vehicle: veiculo });
});

const listar = catchAsync(async (req, res) => {
  const veiculos = await listarVeiculos();
  sendSuccess(res, 200, 'Veículos listados com sucesso.', { vehicles: veiculos });
});

const buscar = catchAsync(async (req, res) => {
  const veiculo = await buscarVeiculoPorId(Number(req.params.id));
  sendSuccess(res, 200, 'Veículo encontrado com sucesso.', { vehicle: veiculo });
});

const atualizar = catchAsync(async (req, res) => {
  const validado = vehicleUpdateSchema.parse(req.body);
  const veiculo = await atualizarVeiculo(Number(req.params.id), validado);
  sendSuccess(res, 200, 'Veículo atualizado com sucesso.', { vehicle: veiculo });
});

const remover = catchAsync(async (req, res) => {
  await removerVeiculo(Number(req.params.id));
  sendSuccess(res, 200, 'Veículo removido com sucesso.', {});
});

module.exports = { criar, listar, buscar, atualizar, remover };
