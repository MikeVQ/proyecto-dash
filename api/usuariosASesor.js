// /api/usuariosAsesor.js
import { connectToDatabase } from "./_dbConnection.js";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  // CORS y preflight
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const db = await connectToDatabase();
  const usuariosColl = db.collection("usuariosAsesor");

  if (req.method === "GET") {
    // /api/usuariosAsesor?asesorId=...
    const { asesorId } = req.query;
    if (!asesorId) {
      return res
        .status(400)
        .json({ error: "Falta el parámetro asesorId en la query." });
    }

    try {
      // Si asesorId se guarda como ObjectId, conviértelo:
      // const query = { asesorId: new ObjectId(asesorId) };
      // O si lo guardas como string, { asesorId }
      const query = { asesorId }; 
      const usuarios = await usuariosColl.find(query).toArray();
      return res.status(200).json(usuarios);
    } catch (error) {
      console.error("Error al listar usuarios:", error);
      return res.status(500).json({ error: error.message });
    }

  } else if (req.method === "POST") {
    // Crear usuario asignado a un asesor
    try {
      const data = req.body;
      // Valida campos mínimos
      if (!data.asesorId || !data.nombre_usuario || !data.email_usuario) {
        return res
          .status(400)
          .json({ error: "Faltan campos (asesorId, nombre_usuario, email_usuario)." });
      }

      // Insertar
      await usuariosColl.insertOne(data);
      return res
        .status(200)
        .json({ success: true, message: "Usuario asignado al asesor." });
    } catch (error) {
      console.error("Error al asignar usuario:", error);
      return res.status(500).json({ error: error.message });
    }

  } else {
    // Otros métodos no permitidos
    return res.status(405).json({ error: "Método no permitido" });
  }
}
