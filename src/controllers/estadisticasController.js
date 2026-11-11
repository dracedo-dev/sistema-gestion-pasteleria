const db = require('../config/db');

const getEstadisticasDashboard = async (req, res) => {
    try {
        // 1. Datos para el gráfico de productos (unidades e ingresos de pedidos confirmados)
        const queryGrafico = `
            SELECT 
                pr.nombre_producto,
                SUM(dp.cantidad) AS total_unidades,
                SUM(dp.cantidad * dp.precio_unitario) AS total_ingresos
            FROM detalle_pedidos dp
            JOIN pedidos p ON dp.id_pedido = p.id_pedido
            JOIN productos pr ON dp.id_producto = pr.id_producto
            WHERE p.pago_confirmado = true
            GROUP BY pr.nombre_producto
            ORDER BY total_unidades DESC
            LIMIT 5;
        `;
        const graficoRes = await db.query(queryGrafico);

        // 2. KPI: Ventas Totales del Mes (usando monto_final y fecha_pedido)
        const queryVentasMes = `
            SELECT COALESCE(SUM(monto_final), 0) AS total_mes
            FROM pedidos
            WHERE pago_confirmado = true 
              AND fecha_pedido >= DATE_TRUNC('month', CURRENT_DATE);
        `;
        const ventasMesRes = await db.query(queryVentasMes);

        // 3. KPI: Pedidos Pendientes (usando pago_confirmado = false)
        const queryPedidosPendientes = `
            SELECT COUNT(*) AS total_pendientes
            FROM pedidos
            WHERE pago_confirmado = false;
        `;
        const pedidosPendientesRes = await db.query(queryPedidosPendientes);

        // 4. KPI: Alertas de Insumos con Stock Bajo
        const queryStockBajo = `
            SELECT COUNT(*) AS total_stock_bajo
            FROM insumos
            WHERE stock_actual <= stock_minimo;
        `;
        const stockBajoRes = await db.query(queryStockBajo);

        // 5. Tabla: Actividad Reciente (Últimos pedidos vinculados con la tabla clientes)
        const queryActividadReciente = `
            SELECT 
                p.id_pedido,
                c.nombre_completo AS cliente,
                p.monto_final AS total,
                p.estado_pedido AS estado,
                p.fecha_pedido
            FROM pedidos p
            JOIN clientes c ON p.id_cliente = c.id_cliente
            ORDER BY p.fecha_pedido DESC
            LIMIT 5;
        `;
        const actividadRes = await db.query(queryActividadReciente);

        // Respuesta consolidada para el Dashboard
        res.json({
            productosGrafico: graficoRes.rows,
            kpis: {
                ventasMes: parseFloat(ventasMesRes.rows[0].total_mes),
                pedidosPendientes: parseInt(pedidosPendientesRes.rows[0].total_pendientes),
                stockBajo: parseInt(stockBajoRes.rows[0].total_stock_bajo)
            },
            actividadReciente: actividadRes.rows
        });

    } catch (error) {
        console.error("Error al obtener estadísticas generales del dashboard:", error);
        res.status(500).json({ error: 'Error al obtener las estadísticas del dashboard' });
    }
};

module.exports = { getVentasPorProducto: getEstadisticasDashboard };