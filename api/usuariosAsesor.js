// /api/usuariosAsesor.js
import { query } from "./dbConnection.js";

export default async function handler(req, res) {
  // Configuración CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  // --- CREAR USUARIO (POST) ---
  if (req.method === "POST") {
    const { nombre_asesor, nombre_usuario, email_usuario, pais, tipo_negocio } = req.body;
    if (!nombre_asesor || !nombre_usuario || !email_usuario || !pais || !tipo_negocio) {
      return res.status(400).json({ error: "Faltan campos obligatorios." });
    }
    try {
      // Verificar duplicado
      const duplicateQuery = `
        SELECT * FROM public.ah_asignaciones
        WHERE asesor = $1 AND nombre = $2 AND email_usuario = $3 AND origen = $4 AND tipo_negocio = $5
      `;
      const dupRes = await query(duplicateQuery, [
        nombre_asesor,
        nombre_usuario,
        email_usuario,
        pais,
        tipo_negocio,
      ]);
      if (dupRes.rows.length > 0) {
        return res.status(409).json({ error: "Este usuario ya existe (duplicado)." });
      }
      // Insertar el nuevo registro
      const insertQuery = `
        INSERT INTO public.ah_asignaciones (email_usuario, nombre, origen, tipo_negocio, asesor)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *, id_registro AS _id
      `;
      const insertRes = await query(insertQuery, [
        email_usuario,
        nombre_usuario,
        pais,
        tipo_negocio,
        nombre_asesor,
      ]);
      return res.status(200).json({ success: true, message: "Usuario asignado con éxito.", usuario: insertRes.rows[0] });
    } catch (error) {
      console.error("Error al insertar usuario:", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }
  }
  // --- LISTAR USUARIOS (GET) ---
  else if (req.method === "GET") {
    const { all, nombre_asesor } = req.query;
    try {
      if (all === "true") {
        const result = await query(
          "SELECT *, id_registro AS _id FROM public.ah_asignaciones ORDER BY id_registro DESC"
        );
        console.log("Listando todos los usuarios:", result.rows);
        return res.status(200).json(result.rows);
      } else {
        if (!nombre_asesor) {
          return res.status(400).json({ error: "Se requiere el nombre del asesor." });
        }
        const result = await query(
          "SELECT *, id_registro AS _id FROM public.ah_asignaciones WHERE asesor = $1 ORDER BY id_registro DESC",
          [nombre_asesor]
        );
        console.log(`Listando usuarios para asesor ${nombre_asesor}:`, result.rows);
        return res.status(200).json(result.rows);
      }
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      return res.status(500).json({ error: "Error interno del servidor.", details: error.message });
    }
  }
  // --- ACTUALIZAR USUARIO (PUT) ---
  else if (req.method === "PUT") {
    const { _id, nombre_asesor, nombre_usuario, email_usuario, pais, tipo_negocio } = req.body;
    if (!_id || !nombre_asesor || !nombre_usuario || !email_usuario || !pais || !tipo_negocio) {
      return res.status(400).json({ error: "Faltan campos obligatorios para actualizar." });
    }
    try {
      // Verificar duplicado (excluyendo el registro actual)
      const duplicateQuery = `
        SELECT * FROM public.ah_asignaciones
        WHERE asesor = $1 AND nombre = $2 AND email_usuario = $3 AND origen = $4 AND tipo_negocio = $5 AND id_registro <> $6
      `;
      const dupRes = await query(duplicateQuery, [
        nombre_asesor,
        nombre_usuario,
        email_usuario,
        pais,
        tipo_negocio,
        _id,
      ]);
      if (dupRes.rows.length > 0) {
        return res.status(409).json({ error: "Este usuario ya existe (duplicado)." });
      }
      const updateQuery = `
        UPDATE public.ah_asignaciones
        SET email_usuario = $1, nombre = $2, origen = $3, tipo_negocio = $4, asesor = $5
        WHERE id_registro = $6
      `;
      const updateRes = await query(updateQuery, [
        email_usuario,
        nombre_usuario,
        pais,
        tipo_negocio,
        nombre_asesor,
        _id,
      ]);
      if (updateRes.rowCount === 0) {
        return res.status(404).json({ error: "Usuario no encontrado o sin cambios." });
      }
      return res.status(200).json({ success: true, message: "Usuario actualizado correctamente." });
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }
  }
  // --- ELIMINAR USUARIO (DELETE) ---
  else if (req.method === "DELETE") {
    const { _id } = req.query;
    if (!_id) {
      return res.status(400).json({ error: "Se requiere el id del usuario." });
    }
    try {
      const deleteQuery = "DELETE FROM public.ah_asignaciones WHERE id_registro = $1";
      const deleteRes = await query(deleteQuery, [_id]);
      if (deleteRes.rowCount === 0) {
        return res.status(404).json({ error: "Usuario no encontrado." });
      }
      return res.status(200).json({ success: true, message: "Usuario eliminado correctamente." });
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }
  } else {
    return res.status(405).json({ error: "Método no permitido" });
  }
}
