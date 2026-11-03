const verificarAutenticacion = (req, res, next) => {
    const tokenOusuario = req.headers['authorization'] || req.headers['Authorization'];
    
    // Para depurar en la terminal del backend y ver qué está llegando
    console.log("Headers recibidos:", req.headers);

    if (!tokenOusuario) {
        return res.status(401).json({ error: 'Acceso no autorizado. Por favor inicie sesión.' });
    }

    next();
};

const verificarAdmin = (req, res, next) => {
    // Aquí puedes verificar si el rol es estrictamente Administrador
    next();
};

module.exports = {
    verificarAutenticacion,
    verificarAdmin
};