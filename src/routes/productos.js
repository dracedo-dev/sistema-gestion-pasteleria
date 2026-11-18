const express = require('express');
const router = express.Router();
const { 
    getProductos, 
    getProductosPublicos,
    createProducto, 
    updateProducto, 
    deleteProducto, 
    getPedidosByProducto 
} = require('../controllers/productos');

router.get('/publicos', getProductosPublicos);
router.get('/', getProductos);
router.get('/:id/pedidos', getPedidosByProducto);
router.post('/', createProducto);
router.put('/:id', updateProducto);
router.delete('/:id', deleteProducto);

module.exports = router;