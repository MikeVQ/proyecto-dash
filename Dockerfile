# Etapa 1: Construcción (build) usando Node.js
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

# Copia todo el código (incluyendo server.js y la carpeta api)
COPY . .

# Construye el frontend (asegúrate de que npm run build genere la carpeta "dist")
RUN npm run build

# Etapa final: Imagen para producción con Node y Nginx
FROM node:20-alpine

# Instala Nginx
RUN apk add --no-cache nginx

# Copia la app frontend construida en el directorio web de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copia la configuración personalizada de Nginx
COPY config/nginx.conf /etc/nginx/nginx.conf

# Copia el código del backend (server.js y la carpeta api)
COPY --from=build /app/server.mjs /app/server.mjs
COPY --from=build /app/api /app/api

# Copia el script de inicio
COPY --from=build /app/start.sh /start.sh
RUN chmod +x /start.sh

# Expone el puerto 80 (Nginx)
EXPOSE 80

# Inicia el script de arranque
CMD ["/start.sh"]
