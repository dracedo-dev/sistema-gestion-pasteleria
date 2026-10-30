const express = require('express');
const router = express.Router();
const { getEscandallo, createEscandallo, updateEscandallo, deleteEscandallo } = require('../controllers/escandallo');
const { verificarAutenticacion } = require('../middleware/authMiddleware');

router.get('/', getEscandallo);
router.post('/', verificarAutenticacion, createEscandallo);
router.put('/:id', verificarAutenticacion, updateEscandallo);
router.delete('/:id', verificarAutenticacion, deleteEscandallo);

module.exports = router;