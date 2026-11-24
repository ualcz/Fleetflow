const catchAsync = require('../../utils/catchAsync');
const { sendSuccess } = require('../../utils/response');
const { tripSchema, tripCompleteSchema } = require('../../validators/schemas');
const {
  criarViagem,
  listarViagens,
  buscarViagemPorId,
  despacharViagem,
  concluirViagem,
  cancelarViagem,
} = require('./trip.service');

const criar = catchAsync(async (req, res) => {
  const validado = tripSchema.parse(req.body);
  const viagem = await criarViagem(validado);
  sendSuccess(res, 201, 'Viagem criada com sucesso.', { trip: viagem });
});

const listar = catchAsync(async (req, res) => {
  const viagens = await listarViagens();
  sendSuccess(res, 200, 'Viagens listadas com sucesso.', { trips: viagens });
});

const buscar = catchAsync(async (req, res) => {
  const viagem = await buscarViagemPorId(Number(req.params.id));
  sendSuccess(res, 200, 'Viagem encontrada com sucesso.', { trip: viagem });
});

const despachar = catchAsync(async (req, res) => {
  const viagem = await despacharViagem(Number(req.params.id));
  sendSuccess(res, 200, 'Viagem despachada com sucesso.', { trip: viagem });
});

const concluir = catchAsync(async (req, res) => {
  const validado = tripCompleteSchema.parse(req.body);
  const viagem = await concluirViagem(Number(req.params.id), validado);
  sendSuccess(res, 200, 'Viagem concluída com sucesso.', { trip: viagem });
});

const cancelar = catchAsync(async (req, res) => {
  const viagem = await cancelarViagem(Number(req.params.id));
  sendSuccess(res, 200, 'Viagem cancelada com sucesso.', { trip: viagem });
});

module.exports = { criar, listar, buscar, despachar, concluir, cancelar };
