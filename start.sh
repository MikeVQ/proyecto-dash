#!/bin/sh
echo "Iniciando backend..."
node /app/server.mjs &
echo "Esperando 5 segundos para que el backend se inicie..."
sleep 5
echo "Iniciando Nginx..."
nginx -g "daemon off;"
