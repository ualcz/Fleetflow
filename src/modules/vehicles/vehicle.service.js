const prisma = require('../../config/prisma');
const AppError = require('../../utils/AppError');

/**
 * Cria um novo veículo (apenas MANAGER)
 */
const criarVeiculo = async (data) => {
  const veiculo = await prisma.vehicle.create({
    data: {
      name: data.name,
      licensePlate: data.licensePlate,
      maxCapacity: data.maxCapacity,
      odometer: data.odometer || 0,
      acquisitionCost: data.acquisitionCost,
      status: 'AVAILABLE',
    },
  });
  return veiculo;
};

/**
 * Lista todos os veículos
 */
const listarVeiculos = async () => {
  return prisma.vehicle.findMany({
    include: {
      _count: { select: { trips: true, maintenanceLogs: true, fuelLogs: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Busca um veículo pelo ID
 */
const buscarVeiculoPorId = async (id) => {
  const veiculo = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      trips: { orderBy: { createdAt: 'desc' }, take: 5 },
      maintenanceLogs: { orderBy: { date: 'desc' }, take: 5 },
      fuelLogs: { orderBy: { date: 'desc' }, take: 5 },
    },
  });
  if (!veiculo) throw new AppError('Veículo não encontrado.', 404);
  return veiculo;
};

/**
 * Atualiza um veículo
 */
const atualizarVeiculo = async (id, data) => {
  const veiculo = await prisma.vehicle.findUnique({ where: { id } });
  if (!veiculo) throw new AppError('Veículo não encontrado.', 404);

  return prisma.vehicle.update({
    where: { id },
    data,
  });
};

/**
 * Remove um veículo (somente se DISPONÍVEL e sem viagens ativas)
 */
const removerVeiculo = async (id) => {
  const veiculo = await prisma.vehicle.findUnique({ where: { id } });
  if (!veiculo) throw new AppError('Veículo não encontrado.', 404);

  if (veiculo.status === 'ON_TRIP') {
    throw new AppError('Não é possível excluir um veículo que está em viagem.', 400);
  }

  const viagensAtivas = await prisma.trip.count({
    where: { vehicleId: id, status: { in: ['DISPATCHED'] } },
  });
  if (viagensAtivas > 0) {
    throw new AppError('Não é possível excluir um veículo com viagens ativas.', 400);
  }

  await prisma.vehicle.delete({ where: { id } });
  return { excluido: true };
};

module.exports = {
  criarVeiculo,
  listarVeiculos,
  buscarVeiculoPorId,
  atualizarVeiculo,
  removerVeiculo,
};
