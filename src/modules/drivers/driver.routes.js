const express = require('express');
const { autenticarToken, autorizarPerfis } = require('../../middleware/auth');
const { criar, listar, buscar, atualizar } = require('./driver.controller');

const router = express.Router();

router.use(autenticarToken);

// GET: all authenticated roles
router.get('/', listar);
router.get('/:id', buscar);

// POST/PATCH: MANAGER or SAFETY
router.post('/', autorizarPerfis('MANAGER', 'SAFETY'), criar);
router.patch('/:id', autorizarPerfis('MANAGER', 'SAFETY'), atualizar);

module.exports = router;
