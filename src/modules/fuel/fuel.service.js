const prisma = require('../../config/prisma');
const AppError = require('../../utils/AppError');

/**
 * Adiciona um registro de abastecimento para um veículo
 */
const criarAbastecimento = async (data) => {
  const veiculo = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
  if (!veiculo) throw new AppError('Veículo não encontrado.', 404);

  return prisma.fuelLog.create({
    data: {
      liters: data.liters,
      cost: data.cost,
      date: new Date(data.date),
      vehicleId: data.vehicleId,
    },
    include: { vehicle: { select: { id: true, name: true } } },
  });
};

/**
 * Lista todos os abastecimentos
 */
const listarAbastecimentos = async () => {
  return prisma.fuelLog.findMany({
    include: { vehicle: { select: { id: true, name: true, licensePlate: true } } },
    orderBy: { date: 'desc' },
  });
};

/**
 * Lista abastecimentos de um veículo específico
 */
const listarAbastecimentosPorVeiculo = async (vehicleId) => {
  const veiculo = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!veiculo) throw new AppError('Veículo não encontrado.', 404);

  return prisma.fuelLog.findMany({
    where: { vehicleId },
    orderBy: { date: 'desc' },
  });
};

module.exports = { criarAbastecimento, listarAbastecimentos, listarAbastecimentosPorVeiculo };
