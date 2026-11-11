const db = require('../config/db');

// Obtener el sorteo actual (o el último creado/activo)
const getSorteo = async (req, res) => {
    try {
        const query = 'SELECT * FROM sorteos ORDER BY id_sorteo DESC LIMIT 1;';
        const { rows } = await db.query(query);
        if (rows.length === 0) {
            return res.json({ id_sorteo: null, titulo: '', descripcion: '', enlace_instagram: '', activo: false });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error("Error al obtener el sorteo:", error);
        res.status(500).json({ error: 'Error al obtener el sorteo' });
    }
};

// Crear o actualizar la configuración del sorteo y su estado activo/inactivo
const guardarSorteo = async (req, res) => {
    try {
        const { titulo, descripcion, enlace_instagram, activo } = req.body;

        // Verificamos si ya existe un registro previo para actualizarlo o insertar uno nuevo
        const check = await db.query('SELECT id_sorteo FROM sorteos ORDER BY id_sorteo DESC LIMIT 1;');
        
        let result;
        if (check.rows.length > 0) {
            const id = check.rows[0].id_sorteo;
            const updateQuery = `
                UPDATE sorteos 
                SET titulo = $1, descripcion = $2, enlace_instagram = $3, activo = $4 
                WHERE id_sorteo = $5 RETURNING *;
            `;
            result = await db.query(updateQuery, [titulo, descripcion, enlace_instagram, activo, id]);
        } else {
            const insertQuery = `
                INSERT INTO sorteos (titulo, descripcion, enlace_instagram, activo) 
                VALUES ($1, $2, $3, $4) RETURNING *;
            `;
            result = await db.query(insertQuery, [titulo, descripcion, enlace_instagram, activo]);
        }

        res.json({ message: 'Sorteo actualizado correctamente', sorteo: result.rows[0] });
    } catch (error) {
        console.error("Error al guardar el sorteo:", error);
        res.status(500).json({ error: 'Error al guardar el sorteo' });
    }
};

module.exports = { getSorteo, guardarSorteo };