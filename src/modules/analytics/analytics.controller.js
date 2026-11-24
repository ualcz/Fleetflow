const catchAsync = require('../../utils/catchAsync');
const { sendSuccess } = require('../../utils/response');
const { obterDashboard, obterAnaliticoPorVeiculo } = require('./analytics.service');

const dashboard = catchAsync(async (req, res) => {
  const dados = await obterDashboard();
  sendSuccess(res, 200, 'Dados do painel carregados com sucesso.', dados);
});

const analiticoPorVeiculo = catchAsync(async (req, res) => {
  const dados = await obterAnaliticoPorVeiculo(Number(req.params.id));
  sendSuccess(res, 200, 'Dados analíticos do veículo carregados com sucesso.', dados);
});

module.exports = { dashboard, analiticoPorVeiculo };
