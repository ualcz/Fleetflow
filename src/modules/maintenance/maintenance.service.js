const prisma = require('../../config/prisma');
const AppError = require('../../utils/AppError');

/**
 * Adiciona um registro de manutenção – define status do veículo como EM_OFICINA
 */
const criarRegistroManutencao = async (data) => {
  const veiculo = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
  if (!veiculo) throw new AppError('Veículo não encontrado.', 404);

  if (veiculo.status === 'ON_TRIP') {
    throw new AppError('Não é possível adicionar manutenção a um veículo que está em viagem.', 400);
  }

  const [registro] = await prisma.$transaction([
    prisma.maintenanceLog.create({
      data: {
        description: data.description,
        cost: data.cost,
        date: new Date(data.date),
        vehicleId: data.vehicleId,
        completed: false,
      },
    }),
    prisma.vehicle.update({
      where: { id: data.vehicleId },
      data: { status: 'IN_SHOP' },
    }),
  ]);

  return registro;
};

/**
 * Lista todos os registros de manutenção
 */
const listarManutencoes = async () => {
  return prisma.maintenanceLog.findMany({
    include: { vehicle: { select: { id: true, name: true, licensePlate: true } } },
    orderBy: { date: 'desc' },
  });
};

/**
 * Conclui um registro de manutenção – define o veículo como DISPONÍVEL
 */
const concluirManutencao = async (id) => {
  const registro = await prisma.maintenanceLog.findUnique({
    where: { id },
    include: { vehicle: true },
  });
  if (!registro) throw new AppError('Registro de manutenção não encontrado.', 404);
  if (registro.completed) throw new AppError('Este registro de manutenção já foi concluído.', 400);

  const [registroAtualizado] = await prisma.$transaction([
    prisma.maintenanceLog.update({
      where: { id },
      data: { completed: true },
    }),
    prisma.vehicle.update({
      where: { id: registro.vehicleId },
      data: { status: 'AVAILABLE' },
    }),
  ]);

  return registroAtualizado;
};

module.exports = { criarRegistroManutencao, listarManutencoes, concluirManutencao };
