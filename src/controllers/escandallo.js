const db = require('../config/db');

const getEscandallo = async (req, res) => {
  try {
    const { q } = req.query;
    let query = `
      SELECT e.*, p.nombre_producto, i.nombre_insumo, i.unidad_medida 
      FROM escandallo_recetas e
      JOIN productos p ON e.id_producto = p.id_producto
      JOIN insumos i ON e.id_insumo = i.id_insumo
      WHERE 1=1
    `;
    let params = [];
    
    if (q) {
      query += ` AND (CAST(e.id_escandallo AS TEXT) ILIKE $1 OR p.nombre_producto ILIKE $1 OR i.nombre_insumo ILIKE $1)`;
      params.push(`%${q}%`);
    }

    query += ' ORDER BY e.id_escandallo ASC;';
    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener recetas:", error);
    res.status(500).json({ error: 'Error al obtener el escandallo' });
  }
};

const createEscandallo = async (req, res) => {
  try {
    const { id_producto, id_insumo, cantidad_requerida } = req.body;

    const query = `
      INSERT INTO escandallo_recetas (id_producto, id_insumo, cantidad_requerida) 
      VALUES ($1, $2, $3) RETURNING *;
    `;
    const { rows } = await db.query(query, [id_producto, id_insumo, cantidad_requerida]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error al crear receta:", error);
    res.status(500).json({ error: 'Error al registrar el insumo en la receta' });
  }
};

const updateEscandallo = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_producto, id_insumo, cantidad_requerida } = req.body;

    const query = `
      UPDATE escandallo_recetas 
      SET id_producto = $1, id_insumo = $2, cantidad_requerida = $3 
      WHERE id_escandallo = $4 RETURNING *;
    `;
    const { rows } = await db.query(query, [id_producto, id_insumo, cantidad_requerida, id]);
    res.json(rows[0]);
  } catch (error) {
    console.error("Error al actualizar receta:", error);
    res.status(500).json({ error: 'Error al actualizar la receta' });
  }
};

const deleteEscandallo = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM escandallo_recetas WHERE id_escandallo = $1;', [id]);
    res.json({ message: 'Ítem de receta eliminado correctamente' });
  } catch (error) {
    console.error("Error al eliminar receta:", error);
    res.status(500).json({ error: 'Error al eliminar el ítem de la receta' });
  }
};

module.exports = { getEscandallo, createEscandallo, updateEscandallo, deleteEscandallo };