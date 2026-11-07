# ==============================================================================
# Multi-Stage Dockerfile for Frontend (React + Vite + Nginx)
# ==============================================================================

# Stage 1: Build the React static assets
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package descriptors first to take advantage of Docker layer caching
COPY package*.json ./

RUN npm ci

# Copy full frontend source code
COPY . .

# Build production bundle
RUN npm run build

# Stage 2: Serve assets with Nginx
FROM nginx:alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# Health check to verify Nginx is actively serving requests
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
