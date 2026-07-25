# Stage 1: Build the Vue 3 Vite application
FROM node:20-alpine AS build-stage
WORKDIR /app

# Copy package manifests & install dependencies
COPY package*.json ./
RUN npm ci

# Copy full application source
COPY . .

# Build the production bundle (outputs to build-prod directory)
RUN npm run build

# Stage 2: Serve built assets using high-performance Nginx web server
FROM nginx:alpine AS production-stage

# Copy custom Nginx SPA configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy production assets from build stage
COPY --from=build-stage /app/build-prod /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
