const db = require('../config/db');
const pool = require('../config/db'); // Importar el pool directamente

const crearPedido = async (req, res) => {
    // Pedir una conexión cliente al pool
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        const { id_cliente, monto_subtotal, monto_descuento, monto_final, canal_notificacion, items } = req.body;

        // Generar un código único para el pedido (ej: PED-1729...)
        const codigo_unico = 'PED-' + Math.floor(100000 + Math.random() * 900000);

        // 1. Insertar el pedido principal respetando el orden y columnas de la BD
        const queryPedido = `
            INSERT INTO pedidos (codigo_unico, id_cliente, estado_pedido, monto_subtotal, monto_descuento, monto_final, canal_notificacion, pago_confirmado)
            VALUES ($1, $2, $3, $4, $5, $6, $7, false)
            RETURNING id_pedido, codigo_unico;
        `;
        const valoresPedido = [
            codigo_unico, 
            id_cliente, 
            'Pendiente', // estado_pedido
            monto_subtotal, 
            monto_descuento || 0, 
            monto_final, 
            canal_notificacion || 'WhatsApp'
        ];
        
        const resPedido = await client.query(queryPedido, valoresPedido);
        const id_pedido = resPedido.rows[0].id_pedido;

        // 2. Iterar e insertar los ítems del detalle del pedido
        for (const item of items) {
            const queryDetalle = `
                INSERT INTO detalle_pedidos (id_pedido, id_producto, cantidad, precio_unitario)
                VALUES ($1, $2, $3, $4)
                RETURNING id_detalle;
            `;
            const valoresDetalle = [id_pedido, item.id_producto, item.cantidad, item.precio_unitario];
            const resDetalle = await client.query(queryDetalle, valoresDetalle);
            const id_detalle = resDetalle.rows[0].id_detalle;

            // 3. Si el ítem trae opciones o toppings seleccionados, guardarlos en detalle_opciones
            if (item.opciones && item.opciones.length > 0) {
                for (const op of item.opciones) {
                    const queryOpcion = `
                        INSERT INTO detalle_opciones (id_detalle, tipo_opcion, nombre_opcion, costo_adicional)
                        VALUES ($1, $2, $3, $4);
                    `;
                    const valoresOpcion = [
                        id_detalle, 
                        op.tipo_opcion || 'Topping', 
                        op.nombre_opcion, 
                        op.costo_adicional || 0
                    ];
                    await client.query(queryOpcion, valoresOpcion);
                }
            }
        }

        await client.query('COMMIT');
        res.status(201).json({ 
            message: 'Pedido registrado con éxito', 
            id_pedido, 
            codigo_unico 
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error al registrar el pedido:', err);
        res.status(500).json({ error: 'Error en el servidor al procesar el pedido.' });
    } finally {
        client.release();
    }
};

// Listar todos los pedidos con los datos del cliente (para el Admin)
const obtenerPedidosAdmin = async (req, res) => {
    try {
        const query = `
            SELECT p.id_pedido, p.codigo_unico, p.fecha_pedido, p.estado_pedido, 
                   p.monto_final, p.canal_notificacion, p.pago_confirmado,
                   c.nombre_completo AS cliente_nombre, c.telefono AS cliente_telefono, c.email AS cliente_email
            FROM pedidos p
            JOIN clientes c ON p.id_cliente = c.id_cliente
            ORDER BY p.fecha_pedido DESC;
        `;
        const { rows } = await db.query(query);
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener pedidos para admin:", error);
        res.status(500).json({ error: 'Error al obtener los pedidos' });
    }
};

// Actualizar el estado del pedido (ej. de 'Pendiente' a 'En preparación', 'Listo', 'Entregado')
const actualizarEstadoPedido = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado_pedido } = req.body;

        const query = `
            UPDATE pedidos 
            SET estado_pedido = $1 
            WHERE id_pedido = $2 
            RETURNING *;
        `;
        const { rows } = await db.query(query, [estado_pedido, id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        res.json({ message: 'Estado actualizado con éxito', pedido: rows[0] });
    } catch (error) {
        console.error("Error al actualizar estado del pedido:", error);
        res.status(500).json({ error: 'Error al actualizar el estado' });
    }
};

// Eliminar un pedido (ej. entregados o cancelados)
const eliminarPedido = async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'DELETE FROM pedidos WHERE id_pedido = $1 RETURNING *;';
        const { rows } = await db.query(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        res.json({ message: 'Pedido eliminado correctamente' });
    } catch (error) {
        console.error("Error al eliminar pedido:", error);
        res.status(500).json({ error: 'Error al eliminar el pedido' });
    }
};

module.exports = { 
    crearPedido,
    obtenerPedidosAdmin,
    actualizarEstadoPedido,
    eliminarPedido
};