const multer = require('multer');
const path = require('path');

// Configuración de almacenamiento físico
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Carpeta en la raíz del proyecto
        cb(null, path.join(__dirname, '../../uploads'));
    },
    filename: (req, file, cb) => {
        // Limpiar espacios y agregar una marca de tiempo única para evitar duplicados
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const originalNameClean = file.originalname.replace(/\s+/g, '_');
        cb(null, uniqueSuffix + '-' + originalNameClean);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // Límite de 5MB por seguridad
});

module.exports = upload;