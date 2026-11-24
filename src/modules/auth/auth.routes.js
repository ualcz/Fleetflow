const express = require('express');
const { registrar, login } = require('./auth.controller');

const router = express.Router();

router.post('/register', registrar);
router.post('/login', login);

module.exports = router;
