const express = require('express');
const router = express.Router();
const { getInsumos, createInsumo, updateInsumo, deleteInsumo, obtenerToppings } = require('../controllers/insumos');

router.get('/', getInsumos);
router.get('/toppings', obtenerToppings);
router.post('/', createInsumo);
router.put('/:id', updateInsumo);
router.delete('/:id', deleteInsumo);

module.exports = router;