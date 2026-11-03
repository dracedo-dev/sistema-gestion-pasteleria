const express = require('express');
const router = express.Router();
const { getEscandallo, createEscandallo, updateEscandallo, deleteEscandallo } = require('../controllers/escandallo');

router.get('/', getEscandallo);
router.post('/', createEscandallo);
router.put('/:id', updateEscandallo);
router.delete('/:id', deleteEscandallo);

module.exports = router;