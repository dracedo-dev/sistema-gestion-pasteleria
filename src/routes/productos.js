const express = require('express');
const router = express.Router();
const { getProductos } = require('../controllers/productos');

router.get('/', getProductos);

module.exports = router;