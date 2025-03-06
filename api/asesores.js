// /api/asesores.js
import { connectToDatabase } from "./_dbConnection.js";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  // CORS y preflight
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Conectar a la base de datos y obtener la colección
  let db, asesoresColl;
  try {
    db = await connectToDatabase();
    asesoresColl = db.collection("asesores");
  } catch (err) {
    console.error("Error al conectar con la base de datos:", err);
    return res.status(500).json({ error: "Error al conectar con la base de datos" });
  }

  if (req.method === "GET") {
    try {
      const search = req.query.search || "";
      let query = {};
      if (search) {
        query = {
          $or: [
            { nombre_asesor: { $regex: search, $options: "i" } },
            { email_asesor: { $regex: search, $options: "i" } }
          ]
        };
      }
      const asesores = await asesoresColl.find(query).toArray();
      return res.status(200).json(asesores);
    } catch (error) {
      console.error("Error en GET /api/asesores:", error);
      return res.status(500).json({ error: error.message });
    }
  } else if (req.method === "POST") {
    try {
      const data = req.body;
      // Validación de campos mínimos
      if (!data.nombre_asesor || !data.email_asesor) {
        return res
          .status(400)
          .json({ error: "Faltan campos obligatorios (nombre_asesor, email_asesor)." });
      }
      // Inserta el nuevo asesor
      await asesoresColl.insertOne(data);
      return res.status(200).json({ success: true, message: "Asesor creado" });
    } catch (error) {
      console.error("Error al crear asesor:", error);
      return res.status(500).json({ error: error.message });
    }
  } else if (req.method === "DELETE") {
    try {
      const { _id } = req.query;
      if (!_id) {
        return res.status(400).json({ error: "Falta el _id del asesor." });
      }
      const result = await asesoresColl.deleteOne({ _id: new ObjectId(_id) });
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "No se encontró el asesor." });
      }
      return res.status(200).json({ success: true, message: "Asesor eliminado" });
    } catch (error) {
      console.error("Error al eliminar asesor:", error);
      return res.status(500).json({ error: error.message });
    }
  } else {
    return res.status(405).json({ error: "Método no permitido" });
  }
}
