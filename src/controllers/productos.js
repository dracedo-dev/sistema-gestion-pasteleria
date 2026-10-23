const db = require('../config/db');

const getProductos = async (req, res) => {
  try {
    const { q } = req.query;
    let query = `
      SELECT p.*, c.nombre_categoria 
      FROM productos p
      JOIN categorias c ON p.id_categoria = c.id_categoria
      WHERE p.activo = true
    `;
    let params = [];

    // Si viene un parámetro de búsqueda "q", filtramos por nombre
    if (q) {
      query += ` AND p.nombre_producto ILIKE $1`;
      params.push(`%${q}%`);
    }

    query += ` ORDER BY p.id_producto ASC;`;

    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

// ... mantén el resto de tus métodos (createProducto, etc.) igual ...

module.exports = {
  getProductos,
  // ... demás funciones que tengas
};