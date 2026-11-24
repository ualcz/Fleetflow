const express = require('express');
const { autenticarToken, autorizarPerfis } = require('../../middleware/auth');
const { criar, listar, concluir } = require('./maintenance.controller');

const router = express.Router();

router.use(autenticarToken);

router.get('/', listar);
router.post('/', autorizarPerfis('MANAGER', 'SAFETY'), criar);
router.patch('/:id/complete', autorizarPerfis('MANAGER', 'SAFETY'), concluir);

module.exports = router;
