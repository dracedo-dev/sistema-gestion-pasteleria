const express = require('express');
const router = express.Router();
const { getVentasPorProducto } = require('../controllers/estadisticasController');

// Ruta libre de token para que el dashboard del admin pueda leer las estadísticas sin trabas
router.get('/ventas-productos', getVentasPorProducto);

module.exports = router;