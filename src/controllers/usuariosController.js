const db = require('../config/db');

// Obtener todos los usuarios con su respectivo rol
const obtenerUsuarios = async (req, res) => {
    try {
        const query = `
            SELECT u.id_usuario, u.nombre_completo, u.email, u.activo, r.id_rol, r.nombre_rol 
            FROM usuarios u 
            LEFT JOIN roles r ON u.id_rol = r.id_rol
        `;
        const { rows } = await db.query(query);
        res.json(rows);
    } catch (err) {
        console.error("Error al obtener usuarios:", err);
        res.status(500).json({ error: 'Error al obtener los usuarios' });
    }
};

// Crear un nuevo usuario
const crearUsuario = async (req, res) => {
    try {
        const { nombre_completo, email, id_rol } = req.body;
        const password_hash = 'temp_password'; // Password temporal por defecto

        const query = `
            INSERT INTO usuarios (nombre_completo, email, id_rol, password_hash, activo) 
            VALUES ($1, $2, $3, $4, true) 
            RETURNING id_usuario, nombre_completo, email, id_rol, activo
        `;
        const { rows } = await db.query(query, [nombre_completo, email, id_rol, password_hash]);
        res.json(rows[0]);
    } catch (err) {
        console.error("Error al crear usuario:", err);
        res.status(500).json({ error: 'Error al crear el usuario' });
    }
};

// Actualizar un usuario
const actualizarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre_completo, email, id_rol } = req.body;
        
        const query = `
            UPDATE usuarios 
            SET nombre_completo = $1, email = $2, id_rol = $3 
            WHERE id_usuario = $4
        `;
        await db.query(query, [nombre_completo, email, id_rol, id]);
        res.json({ message: 'Usuario actualizado correctamente' });
    } catch (err) {
        console.error("Error al actualizar usuario:", err);
        res.status(500).json({ error: 'Error al actualizar el usuario' });
    }
};

// Eliminar (dar de baja lógica) un usuario
const eliminarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'UPDATE usuarios SET activo = false WHERE id_usuario = $1';
        await db.query(query, [id]);
        res.json({ message: 'Usuario desactivado correctamente' });
    } catch (err) {
        console.error("Error al eliminar usuario:", err);
        res.status(500).json({ error: 'Error al eliminar el usuario' });
    }
};

// Cambiar estado activo / inactivo de un usuario
const cambiarEstadoUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        // Consultamos el estado actual para invertirlo
        const userQuery = 'SELECT activo FROM usuarios WHERE id_usuario = $1';
        const { rows } = await db.query(userQuery, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const nuevoEstado = !rows[0].activo;
        const updateQuery = 'UPDATE usuarios SET activo = $1 WHERE id_usuario = $2';
        await db.query(updateQuery, [nuevoEstado, id]);

        res.json({ message: 'Estado actualizado correctamente', activo: nuevoEstado });
    } catch (err) {
        console.error("Error al cambiar estado del usuario:", err);
        res.status(500).json({ error: 'Error al cambiar el estado' });
    }
};

module.exports = {
    obtenerUsuarios,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
    cambiarEstadoUsuario
};