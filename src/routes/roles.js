const express = require('express');
const router = express.Router();
const { getRoles, createRol, updateRol, deleteRol, getUsuariosPorRol } = require('../controllers/roles');
const { verificarAutenticacion } = require('../middleware/authMiddleware');

router.get('/', getRoles);
router.post('/', verificarAutenticacion, createRol);
router.put('/:id', verificarAutenticacion, updateRol);
router.delete('/:id', verificarAutenticacion, deleteRol);

// Obtener usuarios asignados a un rol específico (derivado al controlador)
router.get('/:id/usuarios', verificarAutenticacion, getUsuariosPorRol);

module.exports = router;