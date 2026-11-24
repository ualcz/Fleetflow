const prisma = require('../../config/prisma');

/**
 * Calcula os dados analíticos do painel geral da frota
 */
const obterDashboard = async () => {
  const [veiculos, viagens, abastecimentos, manutencoes, motoristas] = await Promise.all([
    prisma.vehicle.findMany({ include: { fuelLogs: true, maintenanceLogs: true } }),
    prisma.trip.findMany({ include: { vehicle: true } }),
    prisma.fuelLog.aggregate({ _sum: { liters: true, cost: true } }),
    prisma.maintenanceLog.aggregate({ _sum: { cost: true } }),
    prisma.driver.findMany(),
  ]);

  const totalVeiculos = veiculos.length;
  const totalViagens = viagens.length;

  const viagensPorStatus = {
    DRAFT: viagens.filter((v) => v.status === 'DRAFT').length,
    DISPATCHED: viagens.filter((v) => v.status === 'DISPATCHED').length,
    COMPLETED: viagens.filter((v) => v.status === 'COMPLETED').length,
    CANCELLED: viagens.filter((v) => v.status === 'CANCELLED').length,
  };

  const veiculosPorStatus = {
    AVAILABLE: veiculos.filter((v) => v.status === 'AVAILABLE').length,
    ON_TRIP: veiculos.filter((v) => v.status === 'ON_TRIP').length,
    IN_SHOP: veiculos.filter((v) => v.status === 'IN_SHOP').length,
    RETIRED: veiculos.filter((v) => v.status === 'RETIRED').length,
  };

  const motoristasPorStatus = {
    ON_DUTY: motoristas.filter((m) => m.status === 'ON_DUTY').length,
    ON_TRIP: motoristas.filter((m) => m.status === 'ON_TRIP').length,
    OFF_DUTY: motoristas.filter((m) => m.status === 'OFF_DUTY').length,
    SUSPENDED: motoristas.filter((m) => m.status === 'SUSPENDED').length,
  };

  const totalCombustivel = abastecimentos._sum.cost || 0;
  const totalLitros = abastecimentos._sum.liters || 0;
  const totalManutencao = manutencoes._sum.cost || 0;
  const totalCustoOperacional = totalCombustivel + totalManutencao;

  const totalReceita = viagens
    .filter((v) => v.status === 'COMPLETED')
    .reduce((soma, v) => soma + (v.revenue || 0), 0);

  const lucroLiquido = totalReceita - totalCustoOperacional;

  return {
    summary: {
      totalVehicles: totalVeiculos,
      totalDrivers: motoristas.length,
      totalTrips: totalViagens,
      totalRevenue: parseFloat(totalReceita.toFixed(2)),
      totalFuelCost: parseFloat(totalCombustivel.toFixed(2)),
      totalMaintenanceCost: parseFloat(totalManutencao.toFixed(2)),
      totalOperationalCost: parseFloat(totalCustoOperacional.toFixed(2)),
      totalFuelLiters: parseFloat(totalLitros.toFixed(2)),
      netProfit: parseFloat(lucroLiquido.toFixed(2)),
    },
    breakdown: {
      tripsByStatus: viagensPorStatus,
      vehiclesByStatus: veiculosPorStatus,
      driversByStatus: motoristasPorStatus,
    },
  };
};

/**
 * Análise por veículo: eficiência de combustível, ROI, custo operacional
 */
const obterAnaliticoPorVeiculo = async (vehicleId) => {
  const veiculo = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    include: {
      trips: { where: { status: 'COMPLETED' } },
      fuelLogs: true,
      maintenanceLogs: true,
    },
  });
  if (!veiculo) {
    const AppError = require('../../utils/AppError');
    throw new AppError('Veículo não encontrado.', 404);
  }

  // Totais de combustível
  const totalLitros = veiculo.fuelLogs.reduce((soma, f) => soma + f.liters, 0);
  const totalCombustivel = veiculo.fuelLogs.reduce((soma, f) => soma + f.cost, 0);

  // Totais de manutenção
  const totalManutencao = veiculo.maintenanceLogs.reduce((soma, m) => soma + m.cost, 0);

  // Custo operacional total
  const totalCustoOperacional = totalCombustivel + totalManutencao;

  // Receita das viagens concluídas
  const totalReceita = veiculo.trips.reduce((soma, v) => soma + (v.revenue || 0), 0);

  // Distância percorrida (km) a partir do odômetro das viagens concluídas
  const totalKm = veiculo.trips.reduce((soma, v) => {
    if (v.startOdometer !== null && v.endOdometer !== null) {
      return soma + (v.endOdometer - v.startOdometer);
    }
    return soma;
  }, 0);

  // Eficiência de combustível: km / litros
  const eficienciaCombustivel =
    totalLitros > 0
      ? parseFloat((totalKm / totalLitros).toFixed(2))
      : null;

  // ROI: (Receita - Custo Operacional) / Custo de Aquisição
  const roi =
    veiculo.acquisitionCost > 0
      ? parseFloat(
        (((totalReceita - totalCustoOperacional) / veiculo.acquisitionCost) * 100).toFixed(2)
      )
      : null;

  return {
    vehicle: {
      id: veiculo.id,
      name: veiculo.name,
      licensePlate: veiculo.licensePlate,
      status: veiculo.status,
      acquisitionCost: veiculo.acquisitionCost,
      odometer: veiculo.odometer,
    },
    analytics: {
      completedTrips: veiculo.trips.length,
      totalKmCovered: parseFloat(totalKm.toFixed(2)),
      totalFuelLiters: parseFloat(totalLitros.toFixed(2)),
      totalFuelCost: parseFloat(totalCombustivel.toFixed(2)),
      totalMaintenanceCost: parseFloat(totalManutencao.toFixed(2)),
      totalOperationalCost: parseFloat(totalCustoOperacional.toFixed(2)),
      totalRevenue: parseFloat(totalReceita.toFixed(2)),
      fuelEfficiencyKmPerLiter: eficienciaCombustivel,
      roiPercent: roi,
    },
  };
};

module.exports = { obterDashboard, obterAnaliticoPorVeiculo };
