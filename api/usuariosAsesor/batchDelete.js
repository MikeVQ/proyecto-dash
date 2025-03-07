// /api/usuariosAsesor/batchDelete.js
import { query } from "../dbConnection.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { ids } = req.body; // array de IDs a eliminar
    if (!Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ error: "No se proporcionó un array de IDs válido." });
    }

    // Se asume que la tabla es "ah_asignaciones" y la columna identificadora es "id_registro"
    // Utilizamos el operador ANY para eliminar todos los registros cuyos id_registro
    // estén incluidos en el array ids. Se asume que los IDs son números.
    const deleteQuery = `
      DELETE FROM public.ah_asignaciones
      WHERE id_registro = ANY($1::int[])
    `;
    const result = await query(deleteQuery, [ids]);

    return res.status(200).json({
      success: true,
      message: `Se eliminaron ${result.rowCount} usuario(s).`,
    });
  } catch (error) {
    console.error("Error al eliminar usuarios en batch:", error);
    return res.status(500).json({ error: "Error interno del servidor." });
  }
}
