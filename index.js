const express = require('express');
const cors = require('cors');
require('dotenv').config();

const productosRoutes = require('./src/routes/productos');
const categoriasRoutes = require('./src/routes/categorias'); // <--- 1. Importar

const app = express();
app.use(express.json());
app.use(cors());

// Rutas de la API
app.use('/api/productos', productosRoutes);
app.use('/api/categorias', categoriasRoutes); // <--- 2. Usar la ruta

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});