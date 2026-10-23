const express = require('express');
const router = express.Router();
const { getInsumos, createInsumo, updateInsumo } = require('../controllers/insumos');

router.get('/', getInsumos);
router.post('/', createInsumo);
router.put('/:id', updateInsumo);

module.exports = router;