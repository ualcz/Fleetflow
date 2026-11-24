const prisma = require('../../config/prisma');
const AppError = require('../../utils/AppError');

/**
 * Cria uma nova viagem (status RASCUNHO)
 */
const criarViagem = async (data) => {
  // Verificar se o veículo existe
  const veiculo = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
  if (!veiculo) throw new AppError('Veículo não encontrado.', 404);

  // Verificar se o motorista existe
  const motorista = await prisma.driver.findUnique({ where: { id: data.driverId } });
  if (!motorista) throw new AppError('Motorista não encontrado.', 404);

  const viagem = await prisma.trip.create({
    data: {
      cargoWeight: data.cargoWeight,
      vehicleId: data.vehicleId,
      driverId: data.driverId,
      startOdometer: data.startOdometer,
      revenue: data.revenue,
      status: 'DRAFT',
    },
    include: { vehicle: true, driver: true },
  });

  return viagem;
};

/**
 * Lista todas as viagens
 */
const listarViagens = async () => {
  return prisma.trip.findMany({
    include: {
      vehicle: { select: { id: true, name: true, licensePlate: true } },
      driver: { select: { id: true, name: true, licenseNumber: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Busca uma viagem pelo ID
 */
const buscarViagemPorId = async (id) => {
  const viagem = await prisma.trip.findUnique({
    where: { id },
    include: {
      vehicle: true,
      driver: true,
    },
  });
  if (!viagem) throw new AppError('Viagem não encontrada.', 404);
  return viagem;
};

/**
 * Despacha uma viagem – usa transação do Prisma para atomicidade
 * Validações: veículo DISPONÍVEL, motorista DE PLANTÃO, CNH não expirada, carga dentro da capacidade
 */
const despacharViagem = async (id) => {
  const viagem = await prisma.trip.findUnique({
    where: { id },
    include: { vehicle: true, driver: true },
  });
  if (!viagem) throw new AppError('Viagem não encontrada.', 404);
  if (viagem.status !== 'DRAFT') {
    throw new AppError(`Não é possível despachar uma viagem com status: ${viagem.status}.`, 400);
  }

  const { vehicle: veiculo, driver: motorista } = viagem;

  // Validar status do veículo
  if (veiculo.status !== 'AVAILABLE') {
    throw new AppError(`Veículo não está disponível (status atual: ${veiculo.status}).`, 400);
  }

  // Validar status do motorista
  if (motorista.status !== 'ON_DUTY') {
    throw new AppError(`Motorista não está de plantão (status atual: ${motorista.status}).`, 400);
  }

  // Validar validade da CNH
  const hoje = new Date();
  if (new Date(motorista.licenseExpiry) <= hoje) {
    throw new AppError('CNH do motorista está vencida. Não é possível despachar esta viagem.', 400);
  }

  // Validar peso da carga
  if (viagem.cargoWeight > veiculo.maxCapacity) {
    throw new AppError(
      `Peso da carga (${viagem.cargoWeight} kg) excede a capacidade do veículo (${veiculo.maxCapacity} kg).`,
      400
    );
  }

  // Transação atômica: atualiza viagem + veículo + motorista
  const [viagemAtualizada] = await prisma.$transaction([
    prisma.trip.update({
      where: { id },
      data: { status: 'DISPATCHED' },
      include: { vehicle: true, driver: true },
    }),
    prisma.vehicle.update({
      where: { id: veiculo.id },
      data: { status: 'ON_TRIP' },
    }),
    prisma.driver.update({
      where: { id: motorista.id },
      data: { status: 'ON_TRIP' },
    }),
  ]);

  return viagemAtualizada;
};

/**
 * Conclui uma viagem – atualiza odômetro do veículo e restaura status
 */
const concluirViagem = async (id, { endOdometer, revenue }) => {
  const viagem = await prisma.trip.findUnique({
    where: { id },
    include: { vehicle: true, driver: true },
  });
  if (!viagem) throw new AppError('Viagem não encontrada.', 404);
  if (viagem.status !== 'DISPATCHED') {
    throw new AppError(`Não é possível concluir uma viagem com status: ${viagem.status}.`, 400);
  }

  if (endOdometer !== undefined && viagem.startOdometer !== null && endOdometer < viagem.startOdometer) {
    throw new AppError('Odômetro final não pode ser menor que o odômetro inicial.', 400);
  }

  const [viagemAtualizada] = await prisma.$transaction([
    prisma.trip.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        endOdometer: endOdometer ?? undefined,
        revenue: revenue ?? viagem.revenue,
      },
      include: { vehicle: true, driver: true },
    }),
    prisma.vehicle.update({
      where: { id: viagem.vehicle.id },
      data: {
        status: 'AVAILABLE',
        odometer: endOdometer ?? viagem.vehicle.odometer,
      },
    }),
    prisma.driver.update({
      where: { id: viagem.driver.id },
      data: { status: 'ON_DUTY' },
    }),
  ]);

  return viagemAtualizada;
};

/**
 * Cancela uma viagem (RASCUNHO ou DESPACHADA)
 */
const cancelarViagem = async (id) => {
  const viagem = await prisma.trip.findUnique({
    where: { id },
    include: { vehicle: true, driver: true },
  });
  if (!viagem) throw new AppError('Viagem não encontrada.', 404);
  if (viagem.status === 'COMPLETED' || viagem.status === 'CANCELLED') {
    throw new AppError(`Não é possível cancelar uma viagem com status: ${viagem.status}.`, 400);
  }

  const atualizacoes = [
    prisma.trip.update({ where: { id }, data: { status: 'CANCELLED' } }),
  ];

  // Se despachada, liberar veículo e motorista
  if (viagem.status === 'DISPATCHED') {
    atualizacoes.push(
      prisma.vehicle.update({ where: { id: viagem.vehicleId }, data: { status: 'AVAILABLE' } }),
      prisma.driver.update({ where: { id: viagem.driverId }, data: { status: 'ON_DUTY' } })
    );
  }

  const [viagemAtualizada] = await prisma.$transaction(atualizacoes);
  return viagemAtualizada;
};

module.exports = { criarViagem, listarViagens, buscarViagemPorId, despacharViagem, concluirViagem, cancelarViagem };
