const express = require('express');
const router = express.Router();
const { 
    obtenerUsuarios, 
    crearUsuario, 
    actualizarUsuario, 
    cambiarEstadoUsuario 
} = require('../controllers/usuariosController');

router.get('/', obtenerUsuarios);
router.post('/', crearUsuario);
router.put('/:id', actualizarUsuario);
router.patch('/:id/estado', cambiarEstadoUsuario); // <-- Ruta para alternar estado

module.exports = router;