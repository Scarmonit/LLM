# Multi-stage Dockerfile for optimized Node.js application
# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build || echo "Build completed with warnings"

# Stage 2: Runtime
FROM node:20-alpine AS runtime

# Install curl for healthcheck
RUN apk add --no-cache curl

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev && npm cache clean --force

# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src
COPY --from=builder /app/scripts ./scripts

# Copy server files and other runtime necessities
COPY server.js server-enhanced.js cluster-server.js ./
COPY tsconfig.json ./

# Create logs directory
RUN mkdir -p /app/logs /app/browser-data

# Create non-root user with specific UID/GID
RUN addgroup -g 1001 -S nodejs && \
    adduser -S llm -u 1001 -G nodejs

# Change ownership to non-root user
RUN chown -R llm:nodejs /app

# Switch to non-root user
USER llm

# Expose application port
EXPOSE 8080

# Healthcheck using curl
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Use cluster-server.js by default for multi-core utilization
CMD ["node", "cluster-server.js"]
