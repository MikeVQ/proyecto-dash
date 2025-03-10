// server.js
import express from 'express';

// Importa los endpoints desde la carpeta api
import asesoresHandler from './api/asesores.js';
import usuariosAsesorHandler from './api/usuariosAsesor.js';
import batchDeleteHandler from './api/usuariosAsesor/batchDelete.js';
import datosHandler from './api/datos.js';
import historicoUsuariosHandler from './api/historicoUsuarios.js';

const app = express();

// Indica a Express que confíe en el proxy (necesario para evitar redirecciones innecesarias)
app.set('trust proxy', true);

// Middleware para parsear JSON en el cuerpo de las peticiones
app.use(express.json());

// Configura las rutas para tus endpoints
app.all('/asesores', (req, res) => {
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
app.listen(port, '0.0.0.0', () => {
    console.log(`Backend escuchando en el puerto ${port}`);
  });
