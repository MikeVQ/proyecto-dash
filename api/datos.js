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

  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("❌ No se definió la variable MONGO_URI en el entorno.");
  }

  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await client.connect();
  const db = client.db("AHprueba"); // Ajusta el nombre si tu DB se llama distinto
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
  const collection = db.collection("eventos");

  if (req.method === "POST") {
    try {
      // En Vercel, req.body suele llegar como objeto si tu configuración de bodyParser está activa.
      // Si ves "[object Object] is not valid JSON", elimina el JSON.parse() o revisa la config.
      const data = req.body;
      console.log("Datos recibidos:", data);

      // 1. Verificar que existan todas las claves obligatorias
      //    (observaciones es opcional)
      if (
        typeof data.idUsuario === "undefined" ||
        typeof data.emailUsuario === "undefined" ||
        typeof data.nombreUsuario === "undefined" ||
        typeof data.urlActual === "undefined" ||
        typeof data.urlLink === "undefined" ||
        typeof data.fecha === "undefined" ||
        typeof data.emailAsesor === "undefined" ||
        typeof data.asesor === "undefined" ||
        typeof data.origenAsesor === "undefined" ||
        typeof data.tipoNegocioAsesor === "undefined" ||
        typeof data.fechaNotificacion === "undefined" ||
        typeof data.mailEnviado === "undefined" ||
        typeof data.horaNotificacion === "undefined" ||
        typeof data.nombreProducto === "undefined" ||
        typeof data.skuProducto === "undefined"
      ) {
        return res
          .status(400)
          .json({ error: "❌ Error: Faltan claves en la petición" });
      }

      // 2. Validar que los campos obligatorios no vengan vacíos (salvo mailEnviado si es boolean false)
      //    mailEnviado es boolean: si lo hacemos con "!data.mailEnviado" invalidaría "false".
      //    Observaciones es opcional, así que no la chequeamos aquí.
      if (
        !data.idUsuario ||
        !data.emailUsuario ||
        !data.nombreUsuario ||
        !data.urlActual ||
        !data.urlLink ||
        !data.fecha ||
        !data.emailAsesor ||
        !data.asesor ||
        !data.origenAsesor ||
        !data.tipoNegocioAsesor ||
        !data.fechaNotificacion ||
        !data.horaNotificacion ||
        !data.nombreProducto ||
        !data.skuProducto
      ) {
        return res
          .status(400)
          .json({ error: "❌ Error: Faltan datos en la petición" });
      }

      // mailEnviado debe ser boolean (true/false)
      if (typeof data.mailEnviado !== "boolean") {
        return res
          .status(400)
          .json({ error: "❌ Error: 'mailEnviado' debe ser boolean (true/false)" });
      }

      // 3. observaciones es opcional, si no viene la guardamos como null
      const observaciones = data.observaciones ? data.observaciones : null;

      // Insertar en la colección
      // Guardamos los campos con nombres en snake_case
      await collection.insertOne({
        id_usuario: data.idUsuario,
        email_usuario: data.emailUsuario,
        nombre_usuario: data.nombreUsuario,
        url_actual: data.urlActual,
        url_link: data.urlLink,
        fecha: data.fecha,
        email_asesor: data.emailAsesor,
        asesor: data.asesor,
        origen_asesor: data.origenAsesor,
        tipo_negocio_asesor: data.tipoNegocioAsesor,
        fecha_notificacion: data.fechaNotificacion,
        mail_enviado: data.mailEnviado,
        observaciones: observaciones,
        hora_notificacion: data.horaNotificacion,
        nombre_producto: data.nombreProducto,
        sku_producto: data.skuProducto
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
        .sort({ fecha: -1 })
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