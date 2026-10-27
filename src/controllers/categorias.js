const db = require('../config/db');

const getCategorias = async (req, res) => {
  try {
    const { q, estado } = req.query;
    let query = 'SELECT * FROM categorias WHERE 1=1';
    let params = [];
    let paramIndex = 1;

    if (q) {
      query += ` AND (CAST(id_categoria AS TEXT) ILIKE $${paramIndex} OR nombre_categoria ILIKE $${paramIndex})`;
      params.push(`%${q}%`);
      paramIndex++;
    }

    if (estado !== undefined && estado !== '') {
      query += ` AND activo = $${paramIndex}`;
      params.push(estado === 'true');
      paramIndex++;
    }

    query += ' ORDER BY id_categoria ASC;';
    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
};

const createCategoria = async (req, res) => {
  try {
    const { nombre_categoria } = req.body;
    const query = 'INSERT INTO categorias (nombre_categoria, activo) VALUES ($1, true) RETURNING *;';
    const { rows } = await db.query(query, [nombre_categoria]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear la categoría' });
  }
};

// Reutilizamos este update para cambiar nombre y estado al mismo tiempo
const updateCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_categoria, activo } = req.body;

    // Validación: Si se intenta desactivar, verificar que no tenga productos asociados
    if (activo === false) {
      const prodCheck = await db.query('SELECT COUNT(*) FROM productos WHERE id_categoria = $1;', [id]);
      if (parseInt(prodCheck.rows[0].count) > 0) {
        return res.status(400).json({ error: 'No se puede inactivar la categoría porque tiene productos asociados.' });
      }
    }

    const query = 'UPDATE categorias SET nombre_categoria = $1, activo = $2 WHERE id_categoria = $3 RETURNING *;';
    const { rows } = await db.query(query, [nombre_categoria, activo, id]);
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar la categoría' });
  }
};

const deleteCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const prodCheck = await db.query('SELECT COUNT(*) FROM productos WHERE id_categoria = $1;', [id]);
    if (parseInt(prodCheck.rows[0].count) > 0) {
      return res.status(400).json({ error: 'No se puede eliminar la categoría porque tiene productos asociados.' });
    }

    await db.query('DELETE FROM categorias WHERE id_categoria = $1;', [id]);
    res.json({ message: 'Categoría eliminada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar la categoría' });
  }
};

// NUEVO: Endpoint para obtener los productos de una categoría específica (para el "ojito" de detalles)
const getProductosByCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      p.*, c.nombre_categoria 
      FROM productos p
      JOIN categorias c ON p.id_categoria = c.id_categoria
      WHERE p.id_categoria = $1 ORDER BY p.id_producto ASC;
    `;
    const { rows } = await db.query(`SELECT ${query}`, [id]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los productos de la categoría' });
  }
};

module.exports = { getCategorias, createCategoria, updateCategoria, deleteCategoria, getProductosByCategoria };