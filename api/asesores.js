// /api/asesores.js
import { query } from "./dbConnection.js";

export default async function handler(req, res) {
  // Configuración CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  // --- LISTAR ASESORES (GET) ---
  if (req.method === "GET") {
    const search = req.query.search || "";
    try {
      let result;
      if (search) {
        // Filtrar por asesor o email_asesor de forma insensible a mayúsculas
        result = await query(
          `SELECT DISTINCT asesor, email_asesor, id_registro AS _id 
           FROM public.ah_asignaciones 
           WHERE asesor ILIKE $1 OR email_asesor ILIKE $1 
           ORDER BY asesor ASC`,
          [`%${search}%`]
        );
      } else {
        result = await query(
          `SELECT DISTINCT asesor, email_asesor, id_registro AS _id 
           FROM public.ah_asignaciones 
           ORDER BY asesor ASC`
        );
      }
      return res.status(200).json(result.rows);
    } catch (error) {
      console.error("Error al obtener asesores:", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }
  }
  // --- CREAR ASESOR (POST) ---
  else if (req.method === "POST") {
    try {
      const { nombre_asesor, email_asesor } = req.body;
      if (!nombre_asesor || !email_asesor) {
        return res
          .status(400)
          .json({ error: "Faltan campos obligatorios (nombre_asesor, email_asesor)." });
      }
      // Verificar duplicado
      const duplicateQuery = `
        SELECT * FROM public.ah_asignaciones
        WHERE asesor = $1 AND email_asesor = $2
      `;
      const dupRes = await query(duplicateQuery, [nombre_asesor, email_asesor]);
      if (dupRes.rows.length > 0) {
        return res.status(409).json({ error: "Este asesor ya existe (duplicado)." });
      }
      // Insertar nuevo asesor
      const insertQuery = `
        INSERT INTO public.ah_asignaciones (asesor, email_asesor)
        VALUES ($1, $2)
        RETURNING *, id_registro AS _id
      `;
      const insertRes = await query(insertQuery, [nombre_asesor, email_asesor]);
      return res
        .status(200)
        .json({ success: true, message: "Asesor creado", asesor: insertRes.rows[0] });
    } catch (error) {
      console.error("Error al crear asesor:", error);
      return res.status(500).json({ error: error.message });
    }
  }
  // --- ACTUALIZAR ASESOR (PUT) ---
  else if (req.method === "PUT") {
    try {
      const { _id, nombre_asesor, email_asesor } = req.body;
      if (!_id || !nombre_asesor || !email_asesor) {
        return res
          .status(400)
          .json({ error: "Faltan campos obligatorios (nombre_asesor, email_asesor, _id)." });
      }
      const updateQuery = `
        UPDATE public.ah_asignaciones
        SET asesor = $1, email_asesor = $2
        WHERE id_registro = $3
      `;
      const updateRes = await query(updateQuery, [nombre_asesor, email_asesor, _id]);
      if (updateRes.rowCount === 0) {
        return res.status(404).json({ error: "Asesor no encontrado o sin cambios." });
      }
      return res.status(200).json({ success: true, message: "Asesor actualizado" });
    } catch (error) {
      console.error("Error al actualizar asesor:", error);
      return res.status(500).json({ error: error.message });
    }
  }
  // --- ELIMINAR ASESOR (DELETE) ---
  else if (req.method === "DELETE") {
    const { _id } = req.query;
    if (!_id) {
      return res.status(400).json({ error: "Se requiere el id del asesor." });
    }
    try {
      const deleteQuery = "DELETE FROM public.ah_asignaciones WHERE id_registro = $1";
      const deleteRes = await query(deleteQuery, [_id]);
      if (deleteRes.rowCount === 0) {
        return res.status(404).json({ error: "Asesor no encontrado." });
      }
      return res
        .status(200)
        .json({ success: true, message: "Asesor eliminado correctamente." });
    } catch (error) {
      console.error("Error al eliminar asesor:", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }
  }
  // Método no permitido
  else {
    return res.status(405).json({ error: "Método no permitido" });
  }
}
