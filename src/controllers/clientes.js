const db = require('../config/db');

const getClientes = async (req, res) => {
  try {
    const { q } = req.query;
    let query = 'SELECT * FROM clientes WHERE 1=1';
    let params = [];
    
    if (q) {
      query += ' AND (CAST(id_cliente AS TEXT) ILIKE $1 OR dni ILIKE $1 OR nombre_completo ILIKE $1 OR telefono ILIKE $1 OR email ILIKE $1)';
      params.push(`%${q}%`);
    }

    query += ' ORDER BY id_cliente ASC;';
    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
};

const createCliente = async (req, res) => {
  try {
    const { dni, nombre_completo, telefono, email, direccion } = req.body;

    // Validación de formato de email (@ y .com)
    if (email && (!email.includes('@') || !email.toLowerCase().includes('.com'))) {
      return res.status(400).json({ error: 'El email debe contener un "@" y un dominio ".com".' });
    }

    // Validación de duplicados (DNI, Teléfono o Email ya existentes)
    const existing = await db.query(
      'SELECT * FROM clientes WHERE dni = $1 OR telefono = $2 OR (email = $3 AND email IS NOT NULL AND email != \'\');',
      [dni, telefono, email || '']
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Ya existe un cliente registrado con ese DNI, teléfono o email.' });
    }

    const query = 'INSERT INTO clientes (dni, nombre_completo, telefono, email, pedidos_completados) VALUES ($1, $2, $3, $4, 0) RETURNING *;';
    const { rows } = await db.query(query, [dni, nombre_completo, telefono, email || null]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el cliente' });
  }
};

const updateCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { dni, nombre_completo, telefono, email } = req.body;

    if (email && (!email.includes('@') || !email.toLowerCase().includes('.com'))) {
      return res.status(400).json({ error: 'El email debe contener un "@" y un dominio ".com".' });
    }

    // Verificar duplicados excluyendo al cliente actual
    const existing = await db.query(
      'SELECT * FROM clientes WHERE (dni = $1 OR telefono = $2 OR (email = $3 AND email IS NOT NULL AND email != \'\')) AND id_cliente != $4;',
      [dni, telefono, email || '', id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Ya existe otro cliente con ese DNI, teléfono o email.' });
    }

    const query = 'UPDATE clientes SET dni = $1, nombre_completo = $2, telefono = $3, email = $4 WHERE id_cliente = $5 RETURNING *;';
    const { rows } = await db.query(query, [dni, nombre_completo, telefono, email || null, id]);
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el cliente' });
  }
};

const deleteCliente = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM clientes WHERE id_cliente = $1;', [id]);
    res.json({ message: 'Cliente eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el cliente' });
  }
};

module.exports = { getClientes, createCliente, updateCliente, deleteCliente };