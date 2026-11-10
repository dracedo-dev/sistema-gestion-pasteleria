const db = require('../config/db');
const pool = require('../config/db'); // Importar el pool directamente
const { enviarCorreoConLog } = require('../services/emailService');

const crearPedido = async (req, res) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        // Extraemos los datos del body
        const { id_cliente, monto_subtotal, monto_descuento, monto_final, canal_notificacion, metodo_pago, items } = req.body;
        
        // 🌟 Si Multer procesó un archivo, usamos su nombre único en el servidor
        const comprobante_pago = req.file ? req.file.filename : null;

        // El resto de tu lógica de cálculo de descuentos...
        const clienteRes = await client.query('SELECT pedidos_completados FROM clientes WHERE id_cliente = $1', [id_cliente]);
        const pedidosCompletados = clienteRes.rows.length > 0 ? clienteRes.rows[0].pedidos_completados : 0;
        
        const aplicaDescuentoFrecuencia = (pedidosCompletados > 0 && pedidosCompletados % 4 === 3);

        let descuentoFinal = monto_descuento || 0;
        let finalMonto = monto_final;

        if (aplicaDescuentoFrecuencia) {
            const descuentoExtra = monto_subtotal * 0.15;
            descuentoFinal += descuentoExtra;
            finalMonto = monto_subtotal - descuentoFinal;
        }

        const codigo_unico = 'PED-' + Math.floor(100000 + Math.random() * 900000);

        // Insertar pedido... (mantiene tu estructura actual)
        const queryPedido = `
            INSERT INTO pedidos (codigo_unico, id_cliente, estado_pedido, monto_subtotal, monto_descuento, monto_final, canal_notificacion, pago_confirmado, metodo_pago, comprobante_pago)
            VALUES ($1, $2, $3, $4, $5, $6, $7, false, $8, $9)
            RETURNING id_pedido, codigo_unico;
        `;
        const valoresPedido = [
            codigo_unico, 
            id_cliente, 
            'Pendiente', 
            monto_subtotal, 
            descuentoFinal, 
            finalMonto, 
            canal_notificacion || 'WhatsApp',
            metodo_pago || 'Efectivo',
            comprobante_pago // 👈 Guardamos el nombre del archivo gestionado por Multer
        ];
        
        const resPedido = await client.query(queryPedido, valoresPedido);
        const id_pedido = resPedido.rows[0].id_pedido;

        // ... (tu ciclo de inserción de ítems y opciones se queda igual) ...

        await client.query('COMMIT');
        res.status(201).json({ 
            message: 'Pedido registrado con éxito', 
            id_pedido, 
            codigo_unico,
            descuento_aplicado: aplicaDescuentoFrecuencia
        });

        // Disparar correos... (sin cambios)

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
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { id } = req.params;
        const { estado_pedido } = req.body;

        // 1. Obtener el estado actual y el id_cliente del pedido antes de actualizar
        const pedidoAnteriorRes = await client.query('SELECT estado_pedido, id_cliente FROM pedidos WHERE id_pedido = $1', [id]);
        if (pedidoAnteriorRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        const estadoAnterior = pedidoAnteriorRes.rows[0].estado_pedido;
        const idCliente = pedidoAnteriorRes.rows[0].id_cliente;

        // 2. Actualizar el estado del pedido
        const query = `
            UPDATE pedidos 
            SET estado_pedido = $1 
            WHERE id_pedido = $2 
            RETURNING *;
        `;
        const { rows } = await client.query(query, [estado_pedido, id]);
        const pedidoActualizado = rows[0];

        // 🌟 3. Si el pedido pasa a "Entregado" y antes NO estaba entregado, sumamos +1 a pedidos_completados
        if (estado_pedido.toLowerCase() === 'entregado' && estadoAnterior.toLowerCase() !== 'entregado') {
            await client.query(
                'UPDATE clientes SET pedidos_completados = pedidos_completados + 1 WHERE id_cliente = $1',
                [idCliente]
            );
        }

        await client.query('COMMIT');
        res.json({ message: 'Estado actualizado con éxito', pedido: pedidoActualizado });

        // 🌟 NOTIFICACIÓN DE CAMBIO DE ESTADO AL CLIENTE
        const clienteRes = await client.query(
            'SELECT c.email, c.nombre_completo, p.codigo_unico FROM pedidos p JOIN clientes c ON p.id_cliente = c.id_cliente WHERE p.id_pedido = $1',
            [id]
        );
        
        if (clienteRes.rows.length > 0) {
            const { email, nombre_completo, codigo_unico } = clienteRes.rows[0];
            const htmlEstado = `
                <h3>Hola, ${nombre_completo} 👋</h3>
                <p>Tu pedido <strong>#${codigo_unico}</strong> ha actualizado su estado a: <span style="color: #0d6efd; font-weight: bold;">${estado_pedido}</span>.</p>
                <p>¡Gracias por elegir nuestra pastelería!</p>
            `;
            enviarCorreoConLog(id, email, `Actualización de Pedido #${codigo_unico}: ${estado_pedido}`, htmlEstado);
        }

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error al actualizar estado del pedido:", error);
        res.status(500).json({ error: 'Error al actualizar el estado' });
    } finally {
        client.release();
    }
};

// Verificar o rechazar el pago de un pedido
const verificarPagoPedido = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { id } = req.params;
        const { pago_confirmado, motivo_error } = req.body; // pago_confirmado: true/false

        // 1. Actualizar el estado de confirmación del pago en la base de datos
        const query = `
            UPDATE pedidos 
            SET pago_confirmado = $1 
            WHERE id_pedido = $2 
            RETURNING *;
        `;
        const { rows } = await client.query(query, [pago_confirmado, id]);
        if (rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        const pedidoActualizado = rows[0];

        await client.query('COMMIT');
        res.json({ message: 'Estado de pago actualizado con éxito', pedido: pedidoActualizado });

        // 2. Enviar correo automático al cliente según la decisión del Admin
        const clienteRes = await pool.query(
            'SELECT c.email, c.nombre_completo, p.codigo_unico FROM pedidos p JOIN clientes c ON p.id_cliente = c.id_cliente WHERE p.id_pedido = $1',
            [id]
        );

        if (clienteRes.rows.length > 0) {
            const { email, nombre_completo, codigo_unico } = clienteRes.rows[0];

            if (pago_confirmado) {
                // Correo de éxito / pago verificado
                const htmlExito = `
                    <h3>¡Hola, ${nombre_completo}! 🎉</h3>
                    <p>Te informamos que el pago de tu pedido <strong>#${codigo_unico}</strong> ha sido <strong>verificado y confirmado</strong> con éxito.</p>
                    <p>Tu pedido ya está siendo preparado en nuestra pastelería.</p>
                `;
                enviarCorreoConLog(id, email, `Pago Confirmado - Pedido #${codigo_unico}`, htmlExito);
            } else {
                // Correo de error en el pago / comprobante inválido
                const htmlError = `
                    <h3>Hola, ${nombre_completo} ⚠️</h3>
                    <p>Hubo un inconveniente con el pago o comprobante de tu pedido <strong>#${codigo_unico}</strong>.</p>
                    <p><strong>Motivo / Detalle:</strong> ${motivo_error || 'El comprobante no pudo ser validado correctamente.'}</p>
                    <p>Nos pondremos en contacto contigo por WhatsApp a la brevedad para solucionarlo.</p>
                `;
                enviarCorreoConLog(id, email, `⚠️ Importante: Incidente con el pago de tu Pedido #${codigo_unico}`, htmlError);
            }
        }

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error al verificar pago:", error);
        res.status(500).json({ error: 'Error en el servidor al verificar el pago' });
    } finally {
        client.release();
    }
};

// Obtener el detalle completo de un pedido (productos, cantidades y opciones/toppings)
const obtenerDetallePedidoAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Obtener información general del pedido, cliente (incluyendo DNI y teléfono)
        const pedidoQuery = `
            SELECT p.*, 
                   c.nombre_completo AS cliente_nombre, 
                   c.telefono AS cliente_telefono, 
                   c.email AS cliente_email,
                   c.dni AS cliente_dni
            FROM pedidos p
            JOIN clientes c ON p.id_cliente = c.id_cliente
            WHERE p.id_pedido = $1;
        `;
        const pedidoRes = await db.query(pedidoQuery, [id]);

        if (pedidoRes.rows.length === 0) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        const pedido = pedidoRes.rows[0];

        // 2. Obtener los ítems (productos) del detalle del pedido (usando nombre_producto)
        const itemsQuery = `
            SELECT dp.*, pr.nombre_producto AS producto_nombre
            FROM detalle_pedidos dp
            JOIN productos pr ON dp.id_producto = pr.id_producto
            WHERE dp.id_pedido = $1;
        `;
        const itemsRes = await db.query(itemsQuery, [id]);

        // 3. Para cada ítem, buscar sus opciones/toppings asociados
        const itemsConOpciones = await Promise.all(itemsRes.rows.map(async (item) => {
            const opcionesQuery = `
                SELECT tipo_opcion, nombre_opcion, costo_adicional
                FROM detalle_opciones
                WHERE id_detalle = $1;
            `;
            const opcionesRes = await db.query(opcionesQuery, [item.id_detalle]);
            return {
                ...item,
                opciones: opcionesRes.rows
            };
        }));

        res.json({
            pedido,
            items: itemsConOpciones
        });

    } catch (error) {
        console.error("Error al obtener detalle del pedido:", error);
        res.status(500).json({ error: 'Error al obtener el detalle del pedido' });
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
    eliminarPedido,
    obtenerDetallePedidoAdmin,
    verificarPagoPedido
};