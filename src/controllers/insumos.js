const db = require('../config/db');

const getInsumos = async (req, res) => {
  try {
    const { q } = req.query;
    let query = 'SELECT * FROM insumos WHERE 1=1';
    let params = [];
    
    if (q) {
      query += ' AND (CAST(id_insumo AS TEXT) ILIKE $1 OR nombre_insumo ILIKE $1 OR unidad_medida ILIKE $1)';
      params.push(`%${q}%`);
    }

    query += ' ORDER BY id_insumo ASC;';
    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener insumos:", error);
    res.status(500).json({ error: 'Error al obtener los insumos' });
  }
};

const createInsumo = async (req, res) => {
  try {
    const { nombre_insumo, unidad_medida, stock_actual, stock_minimo, costo_unitario } = req.body;

    const query = `
      INSERT INTO insumos (nombre_insumo, unidad_medida, stock_actual, stock_minimo, costo_unitario) 
      VALUES ($1, $2, $3, $4, $5) RETURNING *;
    `;
    const { rows } = await db.query(query, [nombre_insumo, unidad_medida, stock_actual, stock_minimo, costo_unitario]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error al crear insumo:", error);
    res.status(500).json({ error: 'Error al crear el insumo' });
  }
};

const updateInsumo = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_insumo, unidad_medida, stock_actual, stock_minimo, costo_unitario } = req.body;

    const query = `
      UPDATE insumos 
      SET nombre_insumo = $1, unidad_medida = $2, stock_actual = $3, stock_minimo = $4, costo_unitario = $5 
      WHERE id_insumo = $6 RETURNING *;
    `;
    const { rows } = await db.query(query, [nombre_insumo, unidad_medida, stock_actual, stock_minimo, costo_unitario, id]);
    res.json(rows[0]);
  } catch (error) {
    console.error("Error al actualizar insumo:", error);
    res.status(500).json({ error: 'Error al actualizar el insumo' });
  }
};

const deleteInsumo = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM insumos WHERE id_insumo = $1;', [id]);
    res.json({ message: 'Insumo eliminado correctamente' });
  } catch (error) {
    console.error("Error al eliminar insumo:", error);
    res.status(500).json({ error: 'No se puede eliminar el insumo porque está siendo utilizado en una receta (escandallo).' });
  }
};

// En tu insumosController.js
const obtenerToppings = async (req, res) => {
    try {
        const query = `
            SELECT id_insumo, nombre_insumo, stock_actual 
            FROM insumos 
            WHERE es_topping = true
        `;
        const { rows } = await db.query(query);
        res.json(rows);
    } catch (err) {
        console.error('Error al obtener toppings:', err);
        res.status(500).json({ error: 'Error en el servidor al obtener toppings' });
    }
};

module.exports = { getInsumos, createInsumo, updateInsumo, deleteInsumo, obtenerToppings };