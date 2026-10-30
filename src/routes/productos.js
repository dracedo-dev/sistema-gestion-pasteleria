const express = require('express');
const router = express.Router();
const { getProductos, createProducto, updateProducto, deleteProducto, getPedidosByProducto } = require('../controllers/productos');
const { verificarAutenticacion } = require('../middleware/authMiddleware');

router.get('/', getProductos);
router.get('/:id/pedidos', verificarAutenticacion, getPedidosByProducto);
router.post('/', verificarAutenticacion, createProducto);
router.put('/:id', verificarAutenticacion, updateProducto);
router.delete('/:id', verificarAutenticacion, deleteProducto);

module.exports = router;