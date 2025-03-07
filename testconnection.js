// testConnection.js
import { query } from './dbConnection.js';

(async () => {
  try {
    const res = await query('SELECT NOW()');
    console.log('Conexión exitosa, hora actual:', res.rows[0]);
  } catch (error) {
    console.error('Error al conectar a PostgreSQL:', error);
  }
})();
