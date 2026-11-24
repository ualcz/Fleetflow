const express = require('express');
const cors = require('cors');
require('dotenv').config();

const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');

// Importação de rotas
const authRoutes = require('./modules/auth/auth.routes');
const vehicleRoutes = require('./modules/vehicles/vehicle.routes');
const driverRoutes = require('./modules/drivers/driver.routes');
const tripRoutes = require('./modules/trips/trip.routes');
const maintenanceRoutes = require('./modules/maintenance/maintenance.routes');
const fuelRoutes = require('./modules/fuel/fuel.routes');
const analyticsRoutes = require('./modules/analytics/analytics.routes');

const app = express();

// ─────────────────────────────────────────────
// MIDDLEWARES GLOBAIS
// ─────────────────────────────────────────────

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────────
// VERIFICAÇÃO DE SAÚDE
// ─────────────────────────────────────────────

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API FleetFlow está em execução.',
    timestamp: new Date().toISOString(),
    ambiente: process.env.NODE_ENV,
  });
});

// ─────────────────────────────────────────────
// ROTAS DA API
// ─────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/fuel', fuelRoutes);
app.use('/api/analytics', analyticsRoutes);

// ─────────────────────────────────────────────
// ROTA NÃO ENCONTRADA (404)
// ─────────────────────────────────────────────

app.all('*', (req, res, next) => {
  next(new AppError(`Rota não encontrada: ${req.method} ${req.originalUrl}`, 404));
});

// ─────────────────────────────────────────────
// TRATAMENTO GLOBAL DE ERROS
// ─────────────────────────────────────────────

app.use(errorHandler);

module.exports = app;
