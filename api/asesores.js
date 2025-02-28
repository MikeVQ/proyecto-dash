// /api/asesores.js
import { connectToDatabase } from "./_dbConnection.js";

export default async function handler(req, res) {
  // CORS y preflight
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const db = await connectToDatabase();
  const asesoresColl = db.collection("asesores");

  if (req.method === "GET") {
    // Si deseas buscar con ?search=car
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

  } else if (req.method === "POST") {
    // Crear asesor
    try {
      const data = req.body; 
      // Valida campos mínimos
      if (!data.nombre_asesor || !data.email_asesor) {
        return res
          .status(400)
          .json({ error: "Faltan campos obligatorios (nombre_asesor, email_asesor)." });
      }
      // Inserta
      await asesoresColl.insertOne(data);
      return res.status(200).json({ success: true, message: "Asesor creado" });
    } catch (error) {
      console.error("Error al crear asesor:", error);
      return res.status(500).json({ error: error.message });
    }

  } else {
    // Métodos no permitidos
    return res.status(405).json({ error: "Método no permitido" });
  }
}
