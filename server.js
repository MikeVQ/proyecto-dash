// server.js
import express from 'express';

// Importa los endpoints desde la carpeta api
import asesoresHandler from './api/asesores.js';
import usuariosAsesorHandler from './api/usuariosAsesor.js';
import batchDeleteHandler from './api/usuariosAsesor/batchDelete.js';
import datosHandler from './api/datos.js';
import historicoUsuariosHandler from './api/historicoUsuarios.js';

const app = express();

// Middleware para parsear JSON en el cuerpo de las peticiones
app.use(express.json());

// Configura las rutas para tus endpoints
app.all('/api/asesores', (req, res) => {
  return asesoresHandler(req, res);
});

app.all('/api/usuariosAsesor', (req, res) => {
  return usuariosAsesorHandler(req, res);
});

app.all('/api/usuariosAsesor/batchDelete', (req, res) => {
  return batchDeleteHandler(req, res);
});

app.all('/api/datos', (req, res) => {
  return datosHandler(req, res);
});

app.all('/api/historicoUsuarios', (req, res) => {
  return historicoUsuariosHandler(req, res);
});

// Arranca el servidor en el puerto definido (por defecto 5000)
const port = process.env.PORT_API || 5000;
app.listen(port, () => {
  console.log(`Backend escuchando en el puerto ${port}`);
});
