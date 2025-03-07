# Etapa 1: Construcción (build) usando Node.js
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./

# Instala dependencias
RUN npm install

# Copia el resto del código
COPY . .

# Construye el proyecto para producción
RUN npm run build

# Etapa final (servidor web ligero)
FROM nginx:alpine

# Copia la app construida en el directorio web del servidor nginx
COPY --from=0 /app/dist /usr/share/nginx/html

# Expone el puerto 80 por defecto
EXPOSE 80

# Inicia nginx (por defecto)
CMD ["nginx", "-g", "daemon off;"]