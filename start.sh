#!/bin/sh
# Inicia el backend en segundo plano (escuchando en el puerto 5000)
node /app/server.js &
# Inicia Nginx en primer plano
nginx -g "daemon off;"
