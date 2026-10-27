const db = require('../config/db');

// Obtener todos los clientes (con búsqueda opcional)
const getClientes = async (req, res) => {
  try {
    const { q } = req.query;
    let query = 'SELECT * FROM clientes WHERE activo = true';
    let params = [];

    if (q) {
      query += ' AND (nombre ILIKE $1 OR telefono ILIKE $1)';
      params.push(`%${q}%`);
    }

    query += ' ORDER BY id_cliente ASC;';

    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los clientes' });
  }
};

// Crear un nuevo cliente
const createCliente = async (req, res) => {
  try {
    const { nombre, telefono, email, direccion } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre del cliente es obligatorio' });
    }

    const query = `
      INSERT INTO clientes (nombre, telefono, email, direccion)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const { rows } = await db.query(query, [nombre, telefono, email, direccion]);

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar el cliente' });
  }
};

// Actualizar un cliente
const updateCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, telefono, email, direccion } = req.body;

    const query = `
      UPDATE clientes
      SET nombre = $1, telefono = $2, email = $3, direccion = $4
      WHERE id_cliente = $5
      RETURNING *;
    `;
    const { rows } = await db.query(query, [nombre, telefono, email, direccion, id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el cliente' });
  }
};

module.exports = {
  getClientes,
  createCliente,
  updateCliente
};