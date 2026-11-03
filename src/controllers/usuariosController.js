const db = require('../config/db');
const bcrypt = require('bcryptjs'); // Asegúrate de tenerlo instalado si manejas hashes, o ajusta la validación

// Iniciar sesión con validación de contraseña para administradores
const loginUsuario = async (req, res) => {
    try {
        const { email, password } = req.body;
        const query = `
            SELECT u.id_usuario, u.nombre_completo, u.email, u.password_hash, u.activo, r.nombre_rol 
            FROM usuarios u 
            LEFT JOIN roles r ON u.id_rol = r.id_rol 
            WHERE u.email = $1 AND u.activo = true
        `;
        const { rows } = await db.query(query, [email]);

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas o usuario inactivo' });
        }

        const usuario = rows[0];
        const esAdmin = usuario.nombre_rol && usuario.nombre_rol.toLowerCase() === 'administrador';

        // Si es Administrador (u otro rol interno), exigimos y validamos contraseña
        if (esAdmin) {
            if (!password) {
                return res.status(400).json({ error: 'Se requiere contraseña para cuentas administrativas' });
            }
            const passwordValid = (password === usuario.password_hash); 

            if (!passwordValid) {
                return res.status(401).json({ error: 'Contraseña incorrecta' });
            }
        }

        // 🌟 NUEVO: Buscar el id_cliente correspondiente en la tabla clientes usando el email
        const clienteRes = await db.query('SELECT id_cliente FROM clientes WHERE email = $1 LIMIT 1', [usuario.email]);
        if (clienteRes.rows.length > 0) {
            usuario.id_cliente = clienteRes.rows[0].id_cliente;
        } else {
            usuario.id_cliente = null;
        }

        // Limpiamos el hash antes de enviarlo al cliente
        delete usuario.password_hash;

        res.json({
            message: 'Login exitoso',
            usuario,
            redireccion: esAdmin ? '/dashboardAdmin/index.html' : '/dashboardCliente/index.html'
        });
    } catch (err) {
        console.error("Error en login:", err);
        res.status(500).json({ error: 'Error en el servidor al intentar iniciar sesión' });
    }
};

// Registrar nuevo usuario/cliente desde el login público y sincronizarlo en la tabla clientes
const registrarCliente = async (req, res) => {
    // Usamos un cliente del pool para manejar la transacción
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        const { nombre_completo, email, password, dni, telefono } = req.body;

        // 1. Buscar el ID del rol "Cliente"
        const rolRes = await client.query(`SELECT id_rol FROM roles WHERE LOWER(nombre_rol) LIKE '%cliente%' LIMIT 1`);
        let idRolCliente = rolRes.rows.length > 0 ? rolRes.rows[0].id_rol : 2; // Valor por defecto 2 si no lo encuentra

        // 2. Insertar en la tabla 'usuarios'
        const insertUsuarioQuery = `
            INSERT INTO usuarios (nombre_completo, email, password_hash, id_rol, activo)
            VALUES ($1, $2, $3, $4, true)
            RETURNING id_usuario, nombre_completo, email;
        `;
        const userRes = await client.query(insertUsuarioQuery, [nombre_completo, email, password, idRolCliente]);
        const usuarioCreado = userRes.rows[0];

        // 3. Insertar automáticamente en la tabla 'clientes' para que la FK de pedidos no falle
        const insertClienteQuery = `
            INSERT INTO clientes (dni, nombre_completo, telefono, email, pedidos_completados)
            VALUES ($1, $2, $3, $4, 0)
            RETURNING id_cliente;
        `;
        // Usamos valores por defecto si el formulario del cliente no envía DNI o teléfono todavía
        const dniCliente = dni || ('S/D-' + Math.floor(1000 + Math.random() * 9000));
        const telCliente = telefono || 'Sin teléfono';
        
        await client.query(insertClienteQuery, [dniCliente, nombre_completo, telCliente, email]);

        await client.query('COMMIT');

        res.status(201).json({
            message: 'Cuenta registrada y vinculada exitosamente',
            usuario: usuarioCreado
        });

    } catch (err) {
        await client.query('ROLLBACK');
        
        // Código 23505 = Restricción Única Violada (Email o DNI duplicado)
        if (err.code === '23505') {
            return res.status(400).json({ error: 'El correo electrónico o DNI ya se encuentra registrado. Intenta iniciar sesión.' });
        }
        console.error("Error al registrar cuenta:", err);
        res.status(500).json({ error: 'Error interno en el servidor' });
    } finally {
        client.release();
    }
};

// Obtener todos los usuarios con su respectivo rol
const obtenerUsuarios = async (req, res) => {
    try {
        const query = `
            SELECT u.id_usuario, u.nombre_completo, u.email, u.activo, u.id_rol, r.nombre_rol 
            FROM usuarios u 
            LEFT JOIN roles r ON u.id_rol = r.id_rol 
            ORDER BY u.id_usuario ASC
        `;
        const { rows } = await db.query(query);
        res.json(rows);
    } catch (err) {
        console.error("Error al obtener usuarios:", err);
        res.status(500).json({ error: 'Error en el servidor al obtener usuarios' });
    }
};

// Crear un nuevo usuario
const crearUsuario = async (req, res) => {
    try {
        const { nombre_completo, email, id_rol, password } = req.body;

        // Si no mandan contraseña, podemos asignar una por defecto o temporal
        const passwordFinal = password || '123456';

        const query = `
            INSERT INTO usuarios (nombre_completo, email, id_rol, password_hash, activo)
            VALUES ($1, $2, $3, $4, true)
            RETURNING id_usuario, nombre_completo, email
        `;
        
        const { rows } = await db.query(query, [nombre_completo, email, id_rol, passwordFinal]);
        res.status(201).json({ message: 'Usuario creado exitosamente', usuario: rows[0] });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
        }
        console.error("Error al crear usuario:", err);
        res.status(500).json({ error: 'Error en el servidor al crear usuario' });
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
    cambiarEstadoUsuario,
    loginUsuario,
    registrarCliente
};