// /api/asesores.js
import { query } from "./dbConnection.js";

export default async function handler(req, res) {
  // Configuración CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    const search = req.query.search || "";
    try {
      let result;
      if (search) {
        result = await query(
          "SELECT *, id AS _id FROM asesores WHERE nombre_asesor ILIKE $1 OR email_asesor ILIKE $1 ORDER BY id DESC",
          [`%${search}%`]
        );
      } else {
        result = await query("SELECT *, id AS _id FROM asesores ORDER BY id DESC");
      }
      return res.status(200).json(result.rows);
    } catch (error) {
      console.error("Error al obtener asesores:", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }
  } else if (req.method === "POST") {
    try {
      const data = req.body;
      if (!data.nombre_asesor || !data.email_asesor) {
        return res
          .status(400)
          .json({ error: "Faltan campos obligatorios (nombre_asesor, email_asesor)." });
      }
      const result = await query(
        "INSERT INTO asesores (nombre_asesor, email_asesor) VALUES ($1, $2) RETURNING *, id AS _id",
        [data.nombre_asesor, data.email_asesor]
      );
      return res
        .status(200)
        .json({ success: true, message: "Asesor creado", asesor: result.rows[0] });
    } catch (error) {
      console.error("Error al crear asesor:", error);
      return res.status(500).json({ error: error.message });
    }
  } else if (req.method === "PUT") {
    try {
      const { _id, nombre_asesor, email_asesor } = req.body;
      if (!_id || !nombre_asesor || !email_asesor) {
        return res
          .status(400)
          .json({ error: "Faltan campos obligatorios (nombre_asesor, email_asesor, _id)." });
      }
      const result = await query(
        "UPDATE asesores SET nombre_asesor = $1, email_asesor = $2 WHERE id = $3",
        [nombre_asesor, email_asesor, _id]
      );
      if (result.rowCount === 0) {
        return res.status(404).json({ error: "No se encontró el asesor o no hubo cambios." });
      }
      return res.status(200).json({ success: true, message: "Asesor actualizado" });
    } catch (error) {
      console.error("Error al actualizar asesor:", error);
      return res.status(500).json({ error: error.message });
    }
  } else {
    return res.status(405).json({ error: "Método no permitido" });
  }
}