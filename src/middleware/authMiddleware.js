const verificarAutenticacion = (req, res, next) => {
    const tokenUsuario = req.headers['authorization'] || req.headers['Authorization'];

    // Si no viene el token en los headers de la petición fetch
    if (!tokenUsuario) {
        return res.status(401).json({ error: 'Acceso no autorizado. Por favor inicie sesión.' });
    }

    // Aquí puedes validar tu token (o la sesión)
    next();
};

const verificarAdmin = (req, res, next) => {
    // Lógica para verificar rol administrador si lo requieres en la API
    next();
};

module.exports = {
    verificarAutenticacion,
    verificarAdmin
};