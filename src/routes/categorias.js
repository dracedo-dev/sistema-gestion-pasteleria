const express = require('express');
const router = express.Router();
const { getCategorias, createCategoria, updateCategoria, deleteCategoria, getProductosByCategoria } = require('../controllers/categorias');

router.get('/', getCategorias);
router.get('/:id/productos', getProductosByCategoria);
router.post('/', createCategoria);     // Sin verificarAutenticacion
router.put('/:id', updateCategoria);   // Sin verificarAutenticacion
router.delete('/:id', deleteCategoria);// Sin verificarAutenticacion

module.exports = router;