const catchAsync = require('../../utils/catchAsync');
const { sendSuccess } = require('../../utils/response');
const { maintenanceSchema } = require('../../validators/schemas');
const {
  criarRegistroManutencao,
  listarManutencoes,
  concluirManutencao,
} = require('./maintenance.service');

const criar = catchAsync(async (req, res) => {
  const validado = maintenanceSchema.parse(req.body);
  const registro = await criarRegistroManutencao(validado);
  sendSuccess(res, 201, 'Manutenção registrada. Veículo definido como EM OFICINA.', { log: registro });
});

const listar = catchAsync(async (req, res) => {
  const registros = await listarManutencoes();
  sendSuccess(res, 200, 'Registros de manutenção listados com sucesso.', { logs: registros });
});

const concluir = catchAsync(async (req, res) => {
  const registro = await concluirManutencao(Number(req.params.id));
  sendSuccess(res, 200, 'Manutenção concluída. Veículo definido como DISPONÍVEL.', { log: registro });
});

module.exports = { criar, listar, concluir };
