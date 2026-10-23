const db = require('../config/db');

// Obtener todos los productos activos
const getProductos = async (req, res) => {
  try {
    const query = `
      SELECT p.id_producto, p.nombre_producto, p.descripcion, p.precio_base, p.imagen_url, c.nombre_categoria
      FROM productos p
      JOIN categorias c ON p.id_categoria = c.id_categoria
      WHERE p.activo = true;
    `;
    const { rows } = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

module.exports = { getProductos };