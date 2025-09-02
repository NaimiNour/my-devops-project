FROM node:18-alpine

RUN apk add --no-cache curl

WORKDIR /app

# Copy package files for better layer caching
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy app code
COPY . .

# Security: non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "app.js"]