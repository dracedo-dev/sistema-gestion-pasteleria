const db = require('../config/db');

// 1. Obtener todos los insumos
const getInsumos = async (req, res) => {
  try {
    const { q } = req.query;
    let query = 'SELECT * FROM insumos WHERE 1=1';
    let params = [];

    if (q) {
      query += ' AND nombre_insumo ILIKE $1';
      params.push(`%${q}%`);
    }

    query += ' ORDER BY id_insumo ASC;';

    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los insumos' });
  }
};

// 2. Crear un nuevo insumo
const createInsumo = async (req, res) => {
  try {
    const { nombre_insumo, unidad_medida, stock_actual, stock_minimo, costo_unitario } = req.body;

    if (!nombre_insumo || !unidad_medida || costo_unitario === undefined) {
      return res.status(400).json({ error: 'Nombre, unidad de medida y costo unitario son obligatorios' });
    }

    const query = `
      INSERT INTO insumos (nombre_insumo, unidad_medida, stock_actual, stock_minimo, costo_unitario)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [nombre_insumo, unidad_medida, stock_actual || 0, stock_minimo || 0, costo_unitario];
    const { rows } = await db.query(query, values);

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el insumo' });
  }
};

// 3. Actualizar stock o costo de un insumo
const updateInsumo = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_insumo, unidad_medida, stock_actual, stock_minimo, costo_unitario } = req.body;

    const query = `
      UPDATE insumos
      SET nombre_insumo = $1, unidad_medida = $2, stock_actual = $3, stock_minimo = $4, costo_unitario = $5
      WHERE id_insumo = $6
      RETURNING *;
    `;
    const values = [nombre_insumo, unidad_medida, stock_actual, stock_minimo, costo_unitario, id];
    const { rows } = await db.query(query, values);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Insumo no encontrado' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el insumo' });
  }
};

module.exports = {
  getInsumos,
  createInsumo,
  updateInsumo
};