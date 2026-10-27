const express = require('express');
const router = express.Router();
const { getClientes, createCliente, updateCliente } = require('../controllers/clientes');

router.get('/', getClientes);
router.post('/', createCliente);
router.put('/:id', updateCliente);

module.exports = router;