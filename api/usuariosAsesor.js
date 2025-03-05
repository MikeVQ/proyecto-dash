// /api/usuariosAsesor.js
import { connectToDatabase } from "./_dbConnection.js";
import { ObjectId } from "mongodb";

// Función para formatear el nombre (Título: primera letra mayúscula, resto minúsculas)
function formatName(name) {
  if (!name) return "";
  return name
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  // Se agregan los métodos PUT y DELETE a los permitidos
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const db = await connectToDatabase();
  const asesoresColl = db.collection("asesores");
  const usuariosAsesorColl = db.collection("usuariosAsesor");

  // Crear usuario (POST)
  if (req.method === "POST") {
    try {
      const { nombre_asesor, nombre_usuario, email_usuario, pais, tipo_negocio } = req.body;

      // Validaciones básicas
      if (!nombre_asesor || !nombre_usuario || !email_usuario || !pais || !tipo_negocio) {
        return res.status(400).json({ error: "Faltan campos obligatorios." });
      }

      // Buscar el asesor por nombre
      const asesor = await asesoresColl.findOne({ nombre_asesor: nombre_asesor });
      if (!asesor) {
        return res.status(404).json({ error: "Asesor no encontrado." });
      }

      // Aplicar la regla de formato al nombre del usuario
      const formattedName = formatName(nombre_usuario);

      // Insertar usuario asignado al asesor con el nombre formateado
      const usuarioData = {
        asesorId: asesor._id, // Relacionar con el asesor encontrado
        nombre_usuario: formattedName,
        email_usuario,
        pais,
        tipo_negocio
      };

      await usuariosAsesorColl.insertOne(usuarioData);
      return res.status(200).json({ success: true, message: "Usuario asignado correctamente." });
    } catch (error) {
      console.error("Error al asignar usuario:", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }

  // Obtener usuarios de un asesor (GET)
  } else if (req.method === "GET") {
    const { nombre_asesor } = req.query;

    if (!nombre_asesor) {
      return res.status(400).json({ error: "Se requiere el nombre del asesor." });
    }

    // Buscar el asesor
    const asesor = await asesoresColl.findOne({ nombre_asesor: nombre_asesor });
    if (!asesor) {
      return res.status(404).json({ error: "Asesor no encontrado." });
    }

    // Buscar usuarios asignados a ese asesor
    const usuarios = await usuariosAsesorColl.find({ asesorId: asesor._id }).toArray();
    return res.status(200).json(usuarios);

  // Actualizar usuario (PUT)
  } else if (req.method === "PUT") {
    try {
      const { _id, nombre_asesor, nombre_usuario, email_usuario, pais, tipo_negocio } = req.body;

      if (!_id || !nombre_asesor || !nombre_usuario || !email_usuario || !pais || !tipo_negocio) {
        return res.status(400).json({ error: "Faltan campos obligatorios para actualizar." });
      }

      // Buscar el asesor por nombre
      const asesor = await asesoresColl.findOne({ nombre_asesor: nombre_asesor });
      if (!asesor) {
        return res.status(404).json({ error: "Asesor no encontrado." });
      }

      const formattedName = formatName(nombre_usuario);

      const updateResult = await usuariosAsesorColl.updateOne(
        { _id: new ObjectId(_id) },
        { $set: { 
            nombre_usuario: formattedName, 
            email_usuario, 
            pais, 
            tipo_negocio, 
            asesorId: asesor._id 
          } }
      );

      if (updateResult.modifiedCount === 0) {
        return res.status(400).json({ error: "No se pudo actualizar el usuario." });
      }

      return res.status(200).json({ success: true, message: "Usuario actualizado correctamente." });
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }

  // Eliminar usuario (DELETE)
  } else if (req.method === "DELETE") {
    try {
      const { _id } = req.query;

      if (!_id) {
        return res.status(400).json({ error: "Se requiere el id del usuario." });
      }

      const deleteResult = await usuariosAsesorColl.deleteOne({ _id: new ObjectId(_id) });
      if (deleteResult.deletedCount === 0) {
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
