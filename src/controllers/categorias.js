const db = require('../config/db');

// 1. Obtener todas las categorías activas
const getCategorias = async (req, res) => {
  try {
    const { q } = req.query;
    let query = 'SELECT * FROM categorias WHERE activo = true';
    let params = [];

    if (q) {
      query += ' AND nombre_categoria ILIKE $1';
      params.push(`%${q}%`);
    }

    query += ' ORDER BY id_categoria ASC;';

    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las categorías' });
  }
};

// 2. Crear una nueva categoría
const createCategoria = async (req, res) => {
  try {
    const { nombre_categoria } = req.body;
    
    if (!nombre_categoria) {
      return res.status(400).json({ error: 'El nombre de la categoría es obligatorio' });
    }

    const query = `
      INSERT INTO categorias (nombre_categoria) 
      VALUES ($1) 
      RETURNING *;
    `;
    const { rows } = await db.query(query, [nombre_categoria]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear la categoría' });
  }
};

// 3. Actualizar una categoría existente
const updateCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_categoria } = req.body;

    const query = `
      UPDATE categorias 
      SET nombre_categoria = $1 
      WHERE id_categoria = $2 
      RETURNING *;
    `;
    const { rows } = await db.query(query, [nombre_categoria, id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar la categoría' });
  }
};

// 4. Desactivar / Eliminar una categoría
const deleteCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Opción recomendada para tesis: Baja lógica cambiando el estado activo a false
    const query = `
      UPDATE categorias 
      SET activo = false 
      WHERE id_categoria = $1 
      RETURNING *;
    `;
    const { rows } = await db.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.json({ mensaje: 'Categoría desactivada correctamente', categoria: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar la categoría' });
  }
};

module.exports = {
  getCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria
};