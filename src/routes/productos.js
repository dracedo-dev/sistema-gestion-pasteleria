const express = require('express');
const router = express.Router();
const { getProductos, createProducto, updateProducto, deleteProducto, getPedidosByProducto } = require('../controllers/productos');

router.get('/', getProductos);
router.get('/:id/pedidos', getPedidosByProducto);
router.post('/', createProducto);
router.put('/:id', updateProducto);
router.delete('/:id', deleteProducto);

module.exports = router;