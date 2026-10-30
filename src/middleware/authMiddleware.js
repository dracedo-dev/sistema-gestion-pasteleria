// Middleware para verificar si el usuario está autenticado y tiene permisos
const verificarAutenticacion = (req, res, next) => {
    // Como estamos usando APIs REST y frontend modular, 
    // en el backend validamos por medio de headers o tokens (ej: JWT o sesión).
    // Si estás manejando sesiones con localStorage en el cliente, 
    // lo ideal es proteger las rutas del backend y también validar en el frontend.
    
    const tokenOusuario = req.headers['authorization']; // O puedes validar por cookies/sesión

    if (!tokenOusuario) {
        // Si no hay credenciales, bloqueamos y mandamos error o redirigimos
        return res.status(401).json({ error: 'Acceso no autorizado. Por favor inicie sesión.' });
    }

    next(); // Si todo esta bien, continúa hacia la ruta solicitada
};

const verificarAdmin = (req, res, next) => {
    // Aquí puedes verificar si el rol es estrictamente Administrador
    next();
};

module.exports = {
    verificarAutenticacion,
    verificarAdmin
};