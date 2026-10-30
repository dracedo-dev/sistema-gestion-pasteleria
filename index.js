const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const productosRoutes = require('./src/routes/productos');
const categoriasRoutes = require('./src/routes/categorias');
const insumosRoutes = require('./src/routes/insumos');         // <--- Importar
const escandalloRoutes = require('./src/routes/escandallo');   // <--- Importar
const clientesRoutes = require('./src/routes/clientes');     // <--- Importar
const rolesRoutes = require('./src/routes/roles');           // <--- Importar
const usuariosRoutes = require('./src/routes/usuarios');         // <--- Importar
const pedidosRoutes = require('./src/routes/pedidos');         // <--- Importar

const app = express();
app.use(express.json());
app.use(cors());

// Middleware para leer JSON y servir archivos estáticos de la carpeta views
app.use(express.json());
app.use(express.static('src/views'));

// Rutas
app.use('/api/roles', require('./src/routes/roles'));
app.use('/api/categorias', require('./src/routes/categorias'));
app.use('/api/insumos', require('./src/routes/insumos'));
app.use('/api/clientes', require('./src/routes/clientes'));
app.use('/api/productos', require('./src/routes/productos'));
app.use('/api/escandallo', require('./src/routes/escandallo'));
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use(express.static('src/views'));

const PORT = process.env.PORT || 3000;
app.listen(3000, () => {
    console.log('Servidor corriendo en el puerto 3000');
});