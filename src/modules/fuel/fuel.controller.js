const catchAsync = require('../../utils/catchAsync');
const { sendSuccess } = require('../../utils/response');
const { fuelSchema } = require('../../validators/schemas');
const { criarAbastecimento, listarAbastecimentos, listarAbastecimentosPorVeiculo } = require('./fuel.service');

const criar = catchAsync(async (req, res) => {
  const validado = fuelSchema.parse(req.body);
  const registro = await criarAbastecimento(validado);
  sendSuccess(res, 201, 'Abastecimento registrado com sucesso.', { log: registro });
});

const listar = catchAsync(async (req, res) => {
  const registros = await listarAbastecimentos();
  sendSuccess(res, 200, 'Abastecimentos listados com sucesso.', { logs: registros });
});

const listarPorVeiculo = catchAsync(async (req, res) => {
  const registros = await listarAbastecimentosPorVeiculo(Number(req.params.vehicleId));
  sendSuccess(res, 200, 'Abastecimentos do veículo listados com sucesso.', { logs: registros });
});

module.exports = { criar, listar, listarPorVeiculo };
