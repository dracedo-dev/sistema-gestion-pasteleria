const express = require('express');
const router = express.Router();
const { getInsumos, createInsumo, updateInsumo, deleteInsumo, obtenerToppings } = require('../controllers/insumos');
const { verificarAutenticacion } = require('../middleware/authMiddleware');

router.get('/', getInsumos);
router.post('/', verificarAutenticacion, createInsumo);
router.put('/:id', verificarAutenticacion, updateInsumo);
router.delete('/:id', verificarAutenticacion, deleteInsumo);
router.get('/toppings', obtenerToppings);

module.exports = router;