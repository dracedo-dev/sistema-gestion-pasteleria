const express = require('express');
const router = express.Router();
const { getClientes, createCliente, updateCliente, deleteCliente, obtenerPedidosPorCliente } = require('../controllers/clientes');

router.get('/', getClientes);
router.post('/', createCliente);
router.put('/:id', updateCliente);
router.delete('/:id', deleteCliente);
router.get('/:id/pedidos', obtenerPedidosPorCliente);

module.exports = router;