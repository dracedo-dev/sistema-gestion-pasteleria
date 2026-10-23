const db = require('../config/db');

// 1. Obtener la receta/escandallo de un producto específico
const getRecetaPorProducto = async (req, res) => {
  try {
    const { id_producto } = req.params;

    const query = `
      SELECT 
        e.id_escandallo,
        i.id_insumo,
        i.nombre_insumo,
        i.unidad_medida,
        i.costo_unitario,
        e.cantidad_requerida,
        (e.cantidad_requerida * i.costo_unitario) AS costo_parcial
      FROM escandallo_recetas e
      JOIN insumos i ON e.id_insumo = i.id_insumo
      WHERE e.id_producto = $1;
    `;
    const { rows } = await db.query(query, [id_producto]);

    // Calcular el costo total de producción sumando los parciales
    const costoTotalProduccion = rows.reduce((sum, item) => sum + parseFloat(item.costo_parcial), 0);

    res.json({
      id_producto: parseInt(id_producto),
      costo_total_produccion: costoTotalProduccion,
      ingredientes: rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener la receta del producto' });
  }
};

// 2. Asignar o agregar un insumo a la receta de un producto
const addInsumoAReceta = async (req, res) => {
  try {
    const { id_producto, id_insumo, cantidad_requerida } = req.body;

    if (!id_producto || !id_insumo || !cantidad_requerida) {
      return res.status(400).json({ error: 'Producto, insumo y cantidad requerida son obligatorios' });
    }

    const query = `
      INSERT INTO escandallo_recetas (id_producto, id_insumo, cantidad_requerida)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const { rows } = await db.query(query, [id_producto, id_insumo, cantidad_requerida]);

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al agregar el insumo a la receta' });
  }
};

module.exports = {
  getRecetaPorProducto,
  addInsumoAReceta
};