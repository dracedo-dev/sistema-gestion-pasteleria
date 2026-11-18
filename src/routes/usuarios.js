const express = require('express');
const router = express.Router();

const { 
    obtenerUsuarios, 
    crearUsuario, 
    actualizarUsuario, 
    cambiarEstadoUsuario,
    loginUsuario,
    registrarCliente,
    eliminarUsuario // 👈 Asegúrate de incluir esta importación
} = require('../controllers/usuariosController');

// Rutas de la API de usuarios
router.get('/', obtenerUsuarios);
router.post('/', crearUsuario);
router.put('/:id', actualizarUsuario);
router.patch('/:id/estado', cambiarEstadoUsuario);
router.delete('/:id', eliminarUsuario); // 👈 Usar 'router' en lugar de 'rou'
router.post('/login', loginUsuario);
router.post('/registro', registrarCliente);

module.exports = router;