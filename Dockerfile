# Multi-stage Dockerfile for Doctor Clinic & Queue Management System

# Stage 1: Build Frontend
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Production Server
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install server dependencies
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --only=production

# Copy server code
COPY server/ ./

# Copy built frontend assets from builder stage
COPY --from=client-builder /app/client/dist /app/client/dist

# Expose server port
EXPOSE 5000

# Start server
CMD ["node", "server.js"]
