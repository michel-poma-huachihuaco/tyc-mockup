# syntax=docker/dockerfile:1
#
# Imagen del frontend: se construye con Node y se sirve estatica con nginx,
# sin root. Desde frontend/:
#
#   docker build -t tyc-frontend .
#   docker run --rm -p 8080:8080 tyc-frontend
#
# Los @aybarcorp/* entran con el contexto (paquetes/, file: en package.json):
# npm ci no habla con GitHub Packages y la imagen no necesita ningun secreto.
# npm ci exige package-lock.json: el lockfile se commitea.

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
COPY paquetes ./paquetes
RUN npm ci
COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.29-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
    CMD wget -q --spider http://localhost:8080/ || exit 1
