const express = require('express');
const router = express.Router();
const { getInsumos, createInsumo, updateInsumo, deleteInsumo } = require('../controllers/insumos');

router.get('/', getInsumos);
router.post('/', createInsumo);
router.put('/:id', updateInsumo);
router.delete('/:id', deleteInsumo);

module.exports = router;