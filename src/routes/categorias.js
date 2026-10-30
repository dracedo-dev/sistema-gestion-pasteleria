const express = require('express');
const router = express.Router();
const { getCategorias, createCategoria, updateCategoria, deleteCategoria, getProductosByCategoria } = require('../controllers/categorias');
const { verificarAutenticacion } = require('../middleware/authMiddleware');

router.get('/', getCategorias);
router.get('/:id/productos', getProductosByCategoria);
router.post('/', verificarAutenticacion, createCategoria);
router.put('/:id', verificarAutenticacion, updateCategoria);
router.delete('/:id', verificarAutenticacion, deleteCategoria);

module.exports = router;