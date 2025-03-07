// dbConnection.js
const { Pool } = require('pg');

// Configura el pool de conexiones usando las variables de entorno.
// Si las variables de entorno no están definidas, se usarán los valores por defecto.
const pool = new Pool({
  host: process.env.PG_HOST || 'apiweb.cij6bn10nnbn.us-east-1.rds.amazonaws.com',
  port: process.env.PG_PORT || 5440,
  user: process.env.PG_USER || 'apiwebpostgres',
  password: process.env.PG_PASSWORD || 'AhApiWeb2023',
  database: process.env.PG_DATABASE || 'AdrianaHoyosDB',
  // Puedes agregar otros parámetros como max, idleTimeoutMillis, etc.
});

// Función de consulta para reutilizar en los endpoints.
const query = (text, params) => pool.query(text, params);

module.exports = {
  query,
  pool,
};
