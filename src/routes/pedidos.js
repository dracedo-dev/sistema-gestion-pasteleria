const express = require('express');
const router = express.Router();
const { crearPedido, obtenerPedidosAdmin, actualizarEstadoPedido, eliminarPedido, obtenerDetallePedidoAdmin, verificarPagoPedido } = require('../controllers/pedidosController');
const upload = require('../middleware/uploadMiddleware');

// Ruta para registrar un nuevo pedido con sus ítems y opciones/toppings
router.post('/', upload.single('comprobante_pago'), crearPedido);
router.get('/admin/todos', obtenerPedidosAdmin);
router.put('/:id/estado', actualizarEstadoPedido);
router.delete('/:id', eliminarPedido);
router.get('/admin/:id/detalle', obtenerDetallePedidoAdmin);
router.put('/:id/pago', verificarPagoPedido);

module.exports = router;