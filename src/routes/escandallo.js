const express = require('express');
const router = express.Router();
const { getRecetaPorProducto, addInsumoAReceta } = require('../controllers/escandallo');

router.get('/producto/:id_producto', getRecetaPorProducto);
router.post('/', addInsumoAReceta);

module.exports = router;