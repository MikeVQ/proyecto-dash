// /api/usuariosAsesor/batchDelete.js
import { connectToDatabase } from "../_dbConnection.js";
import { ObjectId } from "mongodb";

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
    const db = await connectToDatabase();
    const usuariosAsesorColl = db.collection("usuariosAsesor");

    const { ids } = req.body; // array de IDs a eliminar
    if (!Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ error: "No se proporcionó un array de IDs válido." });
    }

    // Convertimos cada ID a ObjectId
    const objectIds = ids.map((id) => new ObjectId(id));

    // Eliminamos todos los documentos cuyo _id esté en el array
    const result = await usuariosAsesorColl.deleteMany({ _id: { $in: objectIds } });

    return res.status(200).json({
      success: true,
      message: `Se eliminaron ${result.deletedCount} usuario(s).`,
    });
  } catch (error) {
    console.error("Error al eliminar usuarios en batch:", error);
    return res.status(500).json({ error: "Error interno del servidor." });
  }
}
