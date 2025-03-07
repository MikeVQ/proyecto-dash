// /api/_dbConnection.js
import { MongoClient } from "mongodb";

let cachedDb = null;

export async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  const uri = process.env.MONGO_URI; // Define MONGO_URI en Vercel
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
