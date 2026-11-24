const express = require('express');
const { autenticarToken, autorizarPerfis } = require('../../middleware/auth');
const { criar, listar, listarPorVeiculo } = require('./fuel.controller');

const router = express.Router();

router.use(autenticarToken);

router.get('/', listar);
router.get('/vehicle/:vehicleId', listarPorVeiculo);
router.post('/', autorizarPerfis('MANAGER', 'FINANCE', 'DISPATCHER'), criar);

module.exports = router;
