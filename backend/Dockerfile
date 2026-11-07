# ==============================================================================
# Dockerfile for Backend (Node.js + Express)
# ==============================================================================

FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose backend port
EXPOSE 5000

# Container healthcheck using health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:5000/api/health || exit 1

# Start Node.js application
CMD ["node", "server.js"]

