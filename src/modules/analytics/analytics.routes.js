const express = require('express');
const { autenticarToken } = require('../../middleware/auth');
const { dashboard, analiticoPorVeiculo } = require('./analytics.controller');

const router = express.Router();

router.use(autenticarToken);

router.get('/dashboard', dashboard);
router.get('/vehicle/:id', analiticoPorVeiculo);

module.exports = router;
