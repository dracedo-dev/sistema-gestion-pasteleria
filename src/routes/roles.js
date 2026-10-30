const express = require('express');
const router = express.Router();
const { getRoles, createRol, updateRol, deleteRol } = require('../controllers/roles');
const { verificarAutenticacion } = require('../middleware/authMiddleware');

router.get('/', getRoles);
router.post('/', verificarAutenticacion, createRol);
router.put('/:id', verificarAutenticacion, updateRol);
router.delete('/:id', verificarAutenticacion, deleteRol);

// Obtener usuarios asignados a un rol específico
router.get('/:id/usuarios', verificarAutenticacion, async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query(
            `SELECT u.id_usuario, u.nombre_usuario, u.email, u.activo 
             FROM usuarios u 
             WHERE u.id_rol = ?`, 
            [id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener usuarios del rol' });
    }
});

module.exports = router;