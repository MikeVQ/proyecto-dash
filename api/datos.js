import { MongoClient } from "mongodb";

// Para caching de la conexión y evitar reconexiones en cada llamada
let cachedDb = null;

/**
 * Conecta a la base de datos MongoDB (usando la variable de entorno MONGO_URI).
 */
async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  // Lee la URI desde variables de entorno
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("❌ No se definió la variable MONGO_URI en el entorno.");
  }

  const client = new MongoClient(uri, {
    // Opcional: Configuraciones para evitar warnings
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await client.connect();
  const db = client.db("AH_dashboard");
  cachedDb = db;
  return db;
}

/**
 * Handler principal para la Serverless Function en Vercel.
 * Soporta GET y POST.
 */
export default async function handler(req, res) {
  // Habilitar CORS (opcional, si tu front está en otro dominio)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Manejo de preflight (OPTIONS)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Conectar a la base de datos
  const db = await connectToDatabase();
  const collection = db.collection("eventos"); // Nombre de la colección

  if (req.method === "POST") {
    // Procesar datos del POST
    try {
      // En Vercel, req.body llega como string; parseamos manualmente:
      const data = req.body;
      console.log("Datos recibidos:", data);

      // 1. Verificamos que las seis claves existan (no sean undefined)
      if (
        typeof data.idUsuario === "undefined" ||
        typeof data.emailUsuario === "undefined" ||
        typeof data.urlActual === "undefined" ||
        typeof data.linkUrl === "undefined" ||
        typeof data.nombreProducto === "undefined" ||
        typeof data.skuProducto === "undefined"
      ) {
        return res
          .status(400)
          .json({ error: "❌ Error: Faltan claves en la petición" });
      }

      // 2. Exigir que datos no esten vacios y validar datos
      if (
        !data.idUsuario ||
        !data.emailUsuario ||
        !data.urlActual ||
       // !data.linkUrl ||   QUITAR LOS // CUANDO ESTE ACTIVO
        !data.nombreProducto 
       // !data.skuProducto
      ) {
        return res
          .status(400)
          .json({ error: "❌ Error: Faltan datos en la petición" });
      }

      // 3. linkUrl y skuProducto pueden ser null o "", lo aceptamos.
      //    Si vienen vacíos, los guardamos como null en MongoDB.
      const linkUrl = data.linkUrl ? data.linkUrl : null;
      const skuProducto = data.skuProducto ? data.skuProducto : null;
      

      // Insertar en la colección
      await collection.insertOne({
        id_usuario: data.idUsuario,
        email_usuario: data.emailUsuario,
        url_actual: data.urlActual,
        link_url: data.linkUrl,
        nombre_producto: data.nombreProducto,
        sku_producto: data.skuProducto,
        fecha: new Date(), // Fecha de insercion
      });

      return res.status(200).json({ success: "✅ Datos guardados con éxito" });
    } catch (error) {
      console.error("❌ Error al guardar en la BD:", error);
      return res
        .status(500)
        .json({ error: "❌ Error al guardar en la BD", detalle: error.message });
    }
  } else if (req.method === "GET") {
    // Obtener datos
    try {
      const eventos = await collection
        .find({})
        .sort({ fecha: -1 }) // Orden DESC por fecha
        .toArray();

      return res.status(200).json(eventos);
    } catch (error) {
      console.error("❌ Error al obtener datos:", error);
      return res
        .status(500)
        .json({ error: "❌ Error al obtener datos", detalle: error.message });
    }
  } else {
    // Otros métodos no permitidos
    return res.status(405).json({ error: "❌ Error: Método no permitido" });
  }
}
