const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const productosRoutes = require('./src/routes/productos');
const categoriasRoutes = require('./src/routes/categorias');
const insumosRoutes = require('./src/routes/insumos');         
const escandalloRoutes = require('./src/routes/escandallo');   
const clientesRoutes = require('./src/routes/clientes');     
const rolesRoutes = require('./src/routes/roles');           
const usuariosRoutes = require('./src/routes/usuarios');         
const pedidosRoutes = require('./src/routes/pedidos');    
const estadisticasRoutes = require('./src/routes/estadisticas');    
const sorteosRoutes = require('./src/routes/sorteos');

const app = express();

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, 'src/views')));

// 📂 Habilitar la carpeta uploads de la raíz de forma pública y estática
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas de la API
app.use('/api/roles', rolesRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/insumos', insumosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/escandallo', escandalloRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/estadisticas', estadisticasRoutes); // Asegúrate de importar estadisticasRoutes al inicio del archivo);
app.use('/api/sorteos', sorteosRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});