const express = require('express');
const router = express.Router();
const { getCategorias, createCategoria, updateCategoria, deleteCategoria, getProductosByCategoria } = require('../controllers/categorias');

router.get('/', getCategorias);
router.get('/:id/productos', getProductosByCategoria);
router.post('/', createCategoria);
router.put('/:id', updateCategoria);
router.delete('/:id', deleteCategoria);

module.exports = router;