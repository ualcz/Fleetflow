const express = require('express');
const { autenticarToken, autorizarPerfis } = require('../../middleware/auth');
const { criar, listar, buscar, despachar, concluir, cancelar } = require('./trip.controller');

const router = express.Router();

router.use(autenticarToken);

// GET – all roles
router.get('/', listar);
router.get('/:id', buscar);

// POST – DISPATCHER & MANAGER can create trips
router.post('/', autorizarPerfis('DISPATCHER', 'MANAGER'), criar);

// State transitions – DISPATCHER & MANAGER
router.patch('/:id/dispatch', autorizarPerfis('DISPATCHER', 'MANAGER'), despachar);
router.patch('/:id/complete', autorizarPerfis('DISPATCHER', 'MANAGER'), concluir);
router.patch('/:id/cancel', autorizarPerfis('DISPATCHER', 'MANAGER'), cancelar);

module.exports = router;
