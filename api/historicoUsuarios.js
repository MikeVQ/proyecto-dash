// /api/historicoUsuarios.js
import { connectToDatabase } from "./dbConnection.js";

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    const { nombre_asesor } = req.query;
    if (!nombre_asesor) {
      return res.status(400).json({ error: "Se requiere el nombre del asesor." });
    }

    try {
      const db = await connectToDatabase();
      const eventosColl = db.collection("eventos");

      // Filtrar registros por asesor (se asume que el campo es "asesor")
      const historico = await eventosColl.find({ asesor: nombre_asesor }).toArray();

      // Mapear cada documento para obtener solo los campos requeridos
      const historicoMapped = historico.map(item => ({
        nombre_usuario: item.nombre_usuario,
        email_usuario: item.email_usuario,
        url_actual: item.url_actual,
        nombre_producto: item.nombre_producto,  // Nuevo campo para mostrar el nombre del producto
        fecha: item.fecha,
        url_link: item.url_link  // Se usará para el enlace del PDF
      }));

      return res.status(200).json(historicoMapped);
    } catch (error) {
      console.error("Error al obtener histórico:", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }
  } else {
    return res.status(405).json({ error: "Método no permitido" });
  }
}
