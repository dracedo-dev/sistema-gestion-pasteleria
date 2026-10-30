const express = require('express');
const router = express.Router();
const { crearPedido } = require('../controllers/pedidosController');

// Ruta para registrar un nuevo pedido con sus ítems y opciones/toppings
router.post('/', crearPedido);

module.exports = router;