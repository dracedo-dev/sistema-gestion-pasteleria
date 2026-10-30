const db = require('../config/db'); // O la forma en que conectes tu base de datos

const crearPedido = async (req, res) => {
    // Usamos un cliente de la pool para manejar transacciones (BEGIN / COMMIT / ROLLBACK)
    const client = await db.pool.connect();
    
    try {
        await client.query('BEGIN');

        const { id_cliente, monto_subtotal, monto_descuento, monto_final, canal_notificacion, items } = req.body;

        // Generar un código único para el pedido (ej: PED-1729...)
        const codigo_unico = 'PED-' + Math.floor(100000 + Math.random() * 900000);

        // 1. Insertar el pedido principal
        const queryPedido = `
            INSERT INTO pedidos (codigo_unico, id_cliente, monto_subtotal, monto_descuento, monto_final, canal_notificacion, pago_confirmado)
            VALUES ($1, $2, $3, $4, $5, $6, false)
            RETURNING id_pedido, codigo_unico;
        `;
        const valoresPedido = [
            codigo_unico, 
            id_cliente, 
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


module.exports = { 
    crearPedido
};