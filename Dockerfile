# ==========================================
# Stage 1: Dependency Installation
# ==========================================
FROM node:alpine AS dependencies

WORKDIR /app

# Copy package definitions
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# ==========================================
# Stage 2: Production Runtime
# ==========================================
FROM node:alpine AS runner

WORKDIR /app

ENV NODE_ENV=production \
    APP_HOST=0.0.0.0 \
    APP_PORT=5000

# Install dumb-init for proper signal forwarding & tzdata for timezone support
RUN apk --no-cache add dumb-init tzdata

# Create logs directory and assign permissions to non-root node user
RUN mkdir -p /app/storage/logs && chown -R node:node /app

# Copy production node_modules from builder
COPY --from=dependencies /app/node_modules ./node_modules

# Copy application source code
COPY --chown=node:node . .

# Run as non-root user
USER node

# Expose API port
EXPOSE 5000

# Signal handling with dumb-init (PID 1)
ENTRYPOINT ["dumb-init", "--"]

# Start production server
CMD ["node", "src/index.js"]
