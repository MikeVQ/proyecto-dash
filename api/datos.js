// /api/datos.js
import { query } from "./dbConnection.js";

/**
 * Handler para la API de notificaciones.
 * Se espera que la tabla de notificaciones (en el esquema "ah") tenga las siguientes columnas:
 * id_usuario, email_usuario, nombre_usuario, url_actual, url_link, fecha,
 * email_asesor, asesor, origen_asesor, tipo_negocio_asesor, fecha_notificacion,
 * mail_enviado, observaciones, hora_notificacion, nombre_producto, sku_producto.
 */
export default async function handler(req, res) {
  // Habilitar CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "POST") {
    try {
      const data = req.body;
      console.log("Datos recibidos:", data);

      // Validación de claves obligatorias
      if (
        typeof data.idUsuario === "undefined" ||
        typeof data.emailUsuario === "undefined" ||
        typeof data.nombreUsuario === "undefined" ||
        typeof data.urlActual === "undefined" ||
        typeof data.urlLink === "undefined" ||
        typeof data.fecha === "undefined" ||
        typeof data.emailAsesor === "undefined" ||
        typeof data.asesor === "undefined" ||
        typeof data.origenAsesor === "undefined" ||
        typeof data.tipoNegocioAsesor === "undefined" ||
        typeof data.fechaNotificacion === "undefined" ||
        typeof data.mailEnviado === "undefined" ||
        typeof data.horaNotificacion === "undefined" ||
        typeof data.nombreProducto === "undefined" ||
        typeof data.skuProducto === "undefined"
      ) {
        return res
          .status(400)
          .json({ error: "❌ Error: Faltan claves en la petición" });
      }

      // Validar que los campos obligatorios no estén vacíos (excepto mailEnviado)
      if (
        !data.idUsuario ||
        !data.emailUsuario ||
        !data.nombreUsuario ||
        !data.urlActual ||
        !data.urlLink ||
        !data.fecha ||
        !data.emailAsesor ||
        !data.asesor ||
        !data.origenAsesor ||
        !data.tipoNegocioAsesor ||
        !data.fechaNotificacion ||
        !data.horaNotificacion ||
        !data.nombreProducto ||
        !data.skuProducto
      ) {
        return res
          .status(400)
          .json({ error: "❌ Error: Faltan datos en la petición" });
      }

      // mailEnviado debe ser boolean
      if (typeof data.mailEnviado !== "boolean") {
        return res
          .status(400)
          .json({ error: "❌ Error: 'mailEnviado' debe ser boolean (true/false)" });
      }

      // observaciones es opcional; si no se envía, lo asignamos como null
      const observaciones = data.observaciones ? data.observaciones : null;

      // Insertar en la tabla de notificaciones (esquema "ah")
      const insertQuery = `
        INSERT INTO public.ah_notificaciones (
          id_usuario, email_usuario, nombre_usuario, url_actual, url_link, fecha,
          email_asesor, asesor, origen_asesor, tipo_negocio_asesor, fecha_notificacion,
          mail_enviado, observaciones, hora_notificacion, nombre_producto, sku_producto
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      `;
      const values = [
        data.idUsuario,
        data.emailUsuario,
        data.nombreUsuario,
        data.urlActual,
        data.urlLink,
        data.fecha,
        data.emailAsesor,
        data.asesor,
        data.origenAsesor,
        data.tipoNegocioAsesor,
        data.fechaNotificacion,
        data.mailEnviado,
        observaciones,
        data.horaNotificacion,
        data.nombreProducto,
        data.skuProducto,
      ];

      await query(insertQuery, values);

      return res.status(200).json({ success: "✅ Datos guardados con éxito" });
    } catch (error) {
      console.error("❌ Error al guardar en la BD:", error);
      return res
        .status(500)
        .json({ error: "❌ Error al guardar en la BD", detalle: error.message });
    }
  } else if (req.method === "GET") {
    try {
      const result = await query("SELECT * FROM ah.notificaciones ORDER BY fecha DESC");
      return res.status(200).json(result.rows);
    } catch (error) {
      console.error("❌ Error al obtener datos:", error);
      return res
        .status(500)
        .json({ error: "❌ Error al obtener datos", detalle: error.message });
    }
  } else {
    return res
      .status(405)
      .json({ error: "❌ Error: Método no permitido" });
  }
}
