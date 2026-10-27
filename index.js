const express = require('express');
const cors = require('cors');
require('dotenv').config();

const productosRoutes = require('./src/routes/productos');
const categoriasRoutes = require('./src/routes/categorias');
const insumosRoutes = require('./src/routes/insumos');         // <--- Importar
const escandalloRoutes = require('./src/routes/escandallo');   // <--- Importar
const clientesRoutes = require('./src/routes/clientes');     // <--- Importar

const app = express();
app.use(express.json());
app.use(cors());

// Rutas
app.use('/api/productos', productosRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/insumos', insumosRoutes);                        // <--- Usar
app.use('/api/escandallo', escandalloRoutes);                  // <--- Usar
app.use('/api/clientes', clientesRoutes);                      // <--- Usar
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});