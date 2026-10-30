const express = require('express');
const router = express.Router();
const { getClientes, createCliente, updateCliente, deleteCliente } = require('../controllers/clientes');
const { verificarAutenticacion } = require('../middleware/authMiddleware');

router.get('/', getClientes);
router.post('/', verificarAutenticacion, createCliente);
router.put('/:id', verificarAutenticacion, updateCliente);
router.delete('/:id', verificarAutenticacion, deleteCliente);

module.exports = router;