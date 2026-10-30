const express = require('express');
const router = express.Router();

const { 
    obtenerUsuarios, 
    crearUsuario, 
    actualizarUsuario, 
    cambiarEstadoUsuario,
    loginUsuario,
    registrarCliente 
} = require('../controllers/usuariosController');

// Rutas libres de middleware para que el panel pueda operar sin bloqueos 401
router.get('/', obtenerUsuarios);
router.post('/', crearUsuario);
router.put('/:id', actualizarUsuario);
router.patch('/:id/estado', cambiarEstadoUsuario);
router.post('/login', loginUsuario);
router.post('/registro', registrarCliente);

module.exports = router;