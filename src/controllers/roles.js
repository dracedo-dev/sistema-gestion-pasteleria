const db = require('../config/db');

const getRoles = async (req, res) => {
  try {
    const { q } = req.query;
    let query = 'SELECT * FROM roles WHERE 1=1';
    let params = [];
    
    if (q) {
      query += ' AND (CAST(id_rol AS TEXT) ILIKE $1 OR nombre_rol ILIKE $1 OR descripcion ILIKE $1)';
      params.push(`%${q}%`);
    }

    query += ' ORDER BY id_rol ASC;';
    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener roles:", error);
    res.status(500).json({ error: 'Error al obtener los roles' });
  }
};

const createRol = async (req, res) => {
  try {
    const { nombre_rol, descripcion } = req.body;

    const query = `
      INSERT INTO roles (nombre_rol, descripcion) 
      VALUES ($1, $2) RETURNING *;
    `;
    const { rows } = await db.query(query, [nombre_rol, descripcion || null]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error al crear rol:", error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Ya existe un rol con ese nombre.' });
    }
    res.status(500).json({ error: 'Error al crear el rol' });
  }
};

const updateRol = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_rol, descripcion } = req.body;

    const query = `
      UPDATE roles 
      SET nombre_rol = $1, descripcion = $2 
      WHERE id_rol = $3 RETURNING *;
    `;
    const { rows } = await db.query(query, [nombre_rol, descripcion || null, id]);
    res.json(rows[0]);
  } catch (error) {
    console.error("Error al actualizar rol:", error);
    res.status(500).json({ error: 'Error al actualizar el rol' });
  }
};

const deleteRol = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM roles WHERE id_rol = $1;', [id]);
    res.json({ message: 'Rol eliminado correctamente' });
  } catch (error) {
    console.error("Error al eliminar rol:", error);
    res.status(500).json({ error: 'No se puede eliminar el rol porque está asignado a uno o más usuarios.' });
  }
};

module.exports = { getRoles, createRol, updateRol, deleteRol };