// api/dbConnection.js
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  host: process.env.PG_HOST || 'apiweb.cij6bn10nnbn.us-east-1.rds.amazonaws.com',
  port: process.env.PG_PORT || 5440,
  user: process.env.PG_USER || 'apiwebpostgres',
  password: process.env.PG_PASSWORD || 'AhApiWeb2023',
  database: process.env.PG_DATABASE || 'AdrianaHoyosDB',
  ssl: {
    rejectUnauthorized: false, // Esto permite conexiones SSL sin verificar el certificado
  },
});

export const query = (text, params) => pool.query(text, params);
export { pool };