# MULTI-STAGE DOCKERFILE FOR FRONTEND (REACT + VITE + NGINX)
FROM node:20-alpine AS build
WORKDIR /app

# Copy package manifests and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build Vite production bundle
COPY . .
RUN npm run build

# Nginx Alpine Production Stage
FROM nginx:alpine AS final
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
