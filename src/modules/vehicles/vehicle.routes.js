const express = require('express');
const { autenticarToken, autorizarPerfis } = require('../../middleware/auth');
const { criar, listar, buscar, atualizar, remover } = require('./vehicle.controller');

const router = express.Router();

// All vehicle routes require authentication
router.use(autenticarToken);

// GET /vehicles           – All authenticated users can view
router.get('/', listar);
router.get('/:id', buscar);

// POST/PATCH/DELETE       – MANAGER only
router.post('/', autorizarPerfis('MANAGER'), criar);
router.patch('/:id', autorizarPerfis('MANAGER'), atualizar);
router.delete('/:id', autorizarPerfis('MANAGER'), remover);

module.exports = router;
