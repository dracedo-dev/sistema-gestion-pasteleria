const express = require('express');
const router = express.Router();
const { crearPedido, obtenerPedidosAdmin, actualizarEstadoPedido, eliminarPedido } = require('../controllers/pedidosController');

// Ruta para registrar un nuevo pedido con sus ítems y opciones/toppings
router.post('/', crearPedido);
router.get('/admin/todos', obtenerPedidosAdmin);
router.put('/:id/estado', actualizarEstadoPedido);
router.delete('/:id', eliminarPedido);

module.exports = router;