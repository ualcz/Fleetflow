const prisma = require('../../config/prisma');
const AppError = require('../../utils/AppError');

/**
 * Cria um novo motorista
 */
const criarMotorista = async (data) => {
  return prisma.driver.create({
    data: {
      name: data.name,
      licenseNumber: data.licenseNumber,
      licenseExpiry: new Date(data.licenseExpiry),
      safetyScore: data.safetyScore ?? 100,
      status: data.status || 'ON_DUTY',
    },
  });
};

/**
 * Lista todos os motoristas
 */
const listarMotoristas = async () => {
  return prisma.driver.findMany({
    include: {
      _count: { select: { trips: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Busca um motorista pelo ID
 */
const buscarMotoristaPorId = async (id) => {
  const motorista = await prisma.driver.findUnique({
    where: { id },
    include: {
      trips: { orderBy: { createdAt: 'desc' }, take: 5 },
    },
  });
  if (!motorista) throw new AppError('Motorista não encontrado.', 404);
  return motorista;
};

/**
 * Atualiza um motorista
 */
const atualizarMotorista = async (id, data) => {
  const motorista = await prisma.driver.findUnique({ where: { id } });
  if (!motorista) throw new AppError('Motorista não encontrado.', 404);

  const dadosAtualizados = { ...data };
  if (data.licenseExpiry) {
    dadosAtualizados.licenseExpiry = new Date(data.licenseExpiry);
  }

  return prisma.driver.update({ where: { id }, data: dadosAtualizados });
};

module.exports = { criarMotorista, listarMotoristas, buscarMotoristaPorId, atualizarMotorista };
