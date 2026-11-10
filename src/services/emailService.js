const nodemailer = require('nodemailer');
const db = require('../config/db');

// Configuración del transportador SMTP (usando variables de entorno o credenciales de prueba)
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER || 'tu_correo@gmail.com',
        pass: process.env.EMAIL_PASS || 'tu_contraseña_de_aplicacion'
    }
});

// Función central para enviar correos y registrar auditoría en log_notificaciones
const enviarCorreoConLog = async (id_pedido, destinatario, asunto, htmlContenido) => {
    let estadoEnvio = 'Exitoso';
    let mensajeError = null;

    try {
        await transporter.sendMail({
            from: `"Pastelería Artesanal TFI" <${process.env.EMAIL_USER || 'tu_correo@gmail.com'}>`,
            to: destinatario,
            subject: asunto,
            html: htmlContenido
        });
    } catch (error) {
        console.error(`Error al enviar correo a ${destinatario}:`, error);
        estadoEnvio = 'Fallido';
        mensajeError = error.message;
    } finally {
        // Registrar el evento en la tabla log_notificaciones
        try {
            const queryLog = `
                INSERT INTO log_notificaciones (id_pedido, destinatario, estado_envio, mensaje_error)
                VALUES ($1, $2, $3, $4);
            `;
            await db.query(queryLog, [id_pedido, destinatario, estadoEnvio, mensajeError]);
        } catch (errLog) {
            console.error("Error al registrar en log_notificaciones:", errLog);
        }
    }
};

module.exports = { enviarCorreoConLog };