// /api/historicoUsuarios.js
import { query } from "./dbConnection.js";

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    const { nombre_asesor } = req.query;
    if (!nombre_asesor) {
      return res.status(400).json({ error: "Se requiere el nombre del asesor." });
    }
    try {
      const result = await query(
        `SELECT nombre_usuario, email_usuario, url_actual, nombre_producto, fecha, url_link
         FROM eventos
         WHERE asesor = $1
         ORDER BY fecha DESC`,
        [nombre_asesor]
      );
      return res.status(200).json(result.rows);
    } catch (error) {
      console.error("Error al obtener histórico:", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }
  } else {
    return res.status(405).json({ error: "Método no permitido" });
  }
}