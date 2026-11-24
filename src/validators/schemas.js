const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Endereço de e-mail inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  role: z.enum(['MANAGER', 'DISPATCHER', 'SAFETY', 'FINANCE']).optional(),
});

const loginSchema = z.object({
  email: z.string().email('Endereço de e-mail inválido'),
  password: z.string().min(1, 'A senha é obrigatória'),
});

const vehicleSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  licensePlate: z.string().min(1, 'A placa é obrigatória'),
  maxCapacity: z.number().positive('A capacidade máxima deve ser positiva'),
  odometer: z.number().min(0).optional(),
  acquisitionCost: z.number().positive('O custo de aquisição deve ser positivo'),
});

const vehicleUpdateSchema = vehicleSchema.partial().extend({
  status: z.enum(['AVAILABLE', 'ON_TRIP', 'IN_SHOP', 'RETIRED']).optional(),
});

const driverSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  licenseNumber: z.string().min(1, 'O número da CNH é obrigatório'),
  licenseExpiry: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Formato de data inválido para vencimento da CNH',
  }),
  safetyScore: z.number().min(0).max(100).optional(),
  status: z.enum(['ON_DUTY', 'ON_TRIP', 'OFF_DUTY', 'SUSPENDED']).optional(),
});

const driverUpdateSchema = driverSchema.partial();

const tripSchema = z.object({
  cargoWeight: z.number().positive('O peso da carga deve ser positivo'),
  vehicleId: z.number().int().positive('O ID do veículo é obrigatório'),
  driverId: z.number().int().positive('O ID do motorista é obrigatório'),
  revenue: z.number().min(0).optional(),
  startOdometer: z.number().min(0).optional(),
});

const tripCompleteSchema = z.object({
  endOdometer: z.number().min(0, 'O odômetro final deve ser não-negativo'),
  revenue: z.number().min(0, 'A receita deve ser não-negativa').optional(),
});

const maintenanceSchema = z.object({
  description: z.string().min(1, 'A descrição é obrigatória'),
  cost: z.number().positive('O custo deve ser positivo'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Formato de data inválido',
  }),
  vehicleId: z.number().int().positive('O ID do veículo é obrigatório'),
});

const fuelSchema = z.object({
  liters: z.number().positive('A quantidade de litros deve ser positiva'),
  cost: z.number().positive('O custo deve ser positivo'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Formato de data inválido',
  }),
  vehicleId: z.number().int().positive('O ID do veículo é obrigatório'),
});

module.exports = {
  registerSchema,
  loginSchema,
  vehicleSchema,
  vehicleUpdateSchema,
  driverSchema,
  driverUpdateSchema,
  tripSchema,
  tripCompleteSchema,
  maintenanceSchema,
  fuelSchema,
};
