const db = require('../config/db');

const getProductos = async (req, res) => {
  try {
    const { q } = req.query;
    let query = `
      SELECT p.*, c.nombre_categoria 
      FROM productos p
      JOIN categorias c ON p.id_categoria = c.id_categoria
      WHERE 1=1
    `;
    let params = [];
    
    if (q) {
      query += ` AND (CAST(p.id_producto AS TEXT) ILIKE $1 OR p.nombre_producto ILIKE $1 OR c.nombre_categoria ILIKE $1)`;
      params.push(`%${q}%`);
    }

    query += ' ORDER BY p.id_producto ASC;';
    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

const createProducto = async (req, res) => {
  try {
    const { nombre_producto, id_categoria, precio_base, descripcion } = req.body;

    // 🌟 1. Validar duplicidad de producto (ignorando mayúsculas/minúsculas y espacios extra)
    const duplicadoCheck = await db.query(
      'SELECT id_producto FROM productos WHERE LOWER(TRIM(nombre_producto)) = LOWER(TRIM($1));',
      [nombre_producto]
    );

    if (duplicadoCheck.rows.length > 0) {
      return res.status(400).json({ 
        error: `Ya existe un producto registrado con el nombre "${nombre_producto}". Por favor, elija otro nombre o edite el existente.` 
      });
    }

    // 2. Verificar que la categoría esté activa antes de permitir la creación
    const catCheck = await db.query('SELECT activo FROM categorias WHERE id_categoria = $1;', [id_categoria]);
    if (catCheck.rows.length === 0 || !catCheck.rows[0].activo) {
      return res.status(400).json({ error: 'No se puede asociar el producto a una categoría inactiva o inexistente.' });
    }

    // 3. Insertar el nuevo producto
    const query = `
      INSERT INTO productos (nombre_producto, id_categoria, precio_base, descripcion) 
      VALUES ($1, $2, $3, $4) RETURNING *;
    `;
    const { rows } = await db.query(query, [nombre_producto, id_categoria, precio_base, descripcion || null]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error al crear producto:", error);
    res.status(500).json({ error: 'Error al crear el producto' });
  }
};

const updateProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_producto, id_categoria, precio_base, descripcion } = req.body;

    // 🌟 1. Validar duplicidad al actualizar (excluyendo el producto actual que se está editando)
    const duplicadoCheck = await db.query(
      'SELECT id_producto FROM productos WHERE LOWER(TRIM(nombre_producto)) = LOWER(TRIM($1)) AND id_producto != $2;',
      [nombre_producto, id]
    );

    if (duplicadoCheck.rows.length > 0) {
      return res.status(400).json({ 
        error: `Ya existe otro producto registrado con el nombre "${nombre_producto}".` 
      });
    }

    // 2. Verificar categoría activa
    const catCheck = await db.query('SELECT activo FROM categorias WHERE id_categoria = $1;', [id_categoria]);
    if (catCheck.rows.length === 0 || !catCheck.rows[0].activo) {
      return res.status(400).json({ error: 'La categoría seleccionada no está activa.' });
    }

    // 3. Actualizar el producto
    const query = `
      UPDATE productos 
      SET nombre_producto = $1, id_categoria = $2, precio_base = $3, descripcion = $4 
      WHERE id_producto = $5 RETURNING *;
    `;
    const { rows } = await db.query(query, [nombre_producto, id_categoria, precio_base, descripcion || null, id]);
    res.json(rows[0]);
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
};

const deleteProducto = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM productos WHERE id_producto = $1;', [id]);
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
};

const getPedidosByProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT p.id_pedido, p.codigo_unico, p.fecha_pedido, p.estado_pedido, dp.cantidad
      FROM detalle_pedidos dp
      JOIN pedidos p ON dp.id_pedido = p.id_pedido
      WHERE dp.id_producto = $1
      ORDER BY p.fecha_pedido DESC;
    `;
    const { rows } = await db.query(query, [id]);
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener historial del producto:", error);
    res.status(500).json({ error: 'Error al obtener el historial del producto' });
  }
};

module.exports = { getProductos, createProducto, updateProducto, deleteProducto, getPedidosByProducto };