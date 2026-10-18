# ==========================================
# NestMatch Express Backend Dockerfile
# ==========================================
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Install production dependencies only using existing lockfile
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy application source files
COPY . .

# Ensure app directory is owned by unprivileged node user
RUN chown -R node:node /app

# Switch to non-root user
USER node

# Expose backend API port
EXPOSE 5000

# Container healthcheck using Node 20 native fetch against existing health probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://localhost:5000/api/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# Start the application
CMD ["node", "server.js"]
