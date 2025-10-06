
# Multi-stage build para optimizar el tamaño de la imagen
FROM node:18-alpine AS base

# Instalar dependencias necesarias para Prisma y Alpine
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Configurar yarn para usar cache
ENV YARN_CACHE_FOLDER=/app/.yarn-cache

# Instalar dependencias
FROM base AS deps
COPY app/package.json app/yarn.lock* ./
RUN --mount=type=cache,target=/app/.yarn-cache \
    yarn install --production=false

# Rebuild the source code only when needed
FROM base AS builder

# Instalar git para el script de versión
RUN apk add --no-cache git bash

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY app/ .
COPY public/ ./public/

# Copy entrypoint scripts to builder stage (they're now in app/ directory)
# This ensures they're available in the builder stage for copying to runner stage
# Verify the scripts are present and show their full paths
RUN echo "=== Verifying entrypoint scripts in builder stage ===" && \
    ls -la /app/docker-entrypoint.sh /app/start.sh /app/emergency-start.sh && \
    echo "✅ Entrypoint scripts found in builder stage at /app/" && \
    echo "=== Checking if scripts have correct shebang ===" && \
    head -1 /app/docker-entrypoint.sh && \
    echo "=== Builder stage /app directory contents ===" && \
    ls -la /app/ | head -20

# Generate Prisma client with complete runtime
RUN npx prisma generate --generator client

# Copy and prepare the standalone build script
COPY build-with-standalone.sh ./
RUN chmod +x build-with-standalone.sh

# Build the application with standalone output - FORCE REBUILD NO CACHE
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_OUTPUT_MODE=standalone
ENV BUILD_TIMESTAMP=20251001_CITAPLANNER_DEPLOYMENT
RUN echo "Force rebuild timestamp: $BUILD_TIMESTAMP" && ./build-with-standalone.sh

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# CRITICAL: Install bash first - required for entrypoint script execution
# Also install diagnostic tools for network troubleshooting
RUN apk add --no-cache bash postgresql-client bind-tools netcat-openbsd coreutils

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# CRITICAL: Copy from standalone/app/* because outputFileTracingRoot creates nested structure
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone/app ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma files with CORRECT PERMISSIONS - COMPLETE RUNTIME + CLI
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.bin ./node_modules/.bin

# CRITICAL FIX: Copy entrypoint scripts AFTER standalone output
# The standalone output at /app/.next/standalone/app contains the built app
# but NOT our custom scripts. We must copy them from the builder stage
# where they exist at /app/ (from "COPY app/ ." command)
COPY --from=builder --chown=nextjs:nodejs /app/docker-entrypoint.sh ./docker-entrypoint.sh
COPY --from=builder --chown=nextjs:nodejs /app/start.sh ./start.sh
COPY --from=builder --chown=nextjs:nodejs /app/emergency-start.sh ./emergency-start.sh
RUN chmod +x docker-entrypoint.sh start.sh emergency-start.sh

# Verify entrypoint scripts are present in runner stage
RUN echo "=== RUNNER STAGE VERIFICATION ===" && \
    echo "Checking entrypoint scripts:" && \
    ls -la /app/docker-entrypoint.sh /app/start.sh /app/emergency-start.sh && \
    echo "Verifying bash installation:" && \
    which bash && bash --version | head -1 && \
    echo "Checking script shebang:" && \
    head -1 /app/docker-entrypoint.sh && \
    echo "✅ All entrypoint scripts verified in runner stage"

# Create writable directory for Prisma with correct permissions
RUN mkdir -p node_modules/.prisma && chown -R nextjs:nodejs node_modules/.prisma
RUN mkdir -p node_modules/@prisma && chown -R nextjs:nodejs node_modules/@prisma
RUN mkdir -p node_modules/.bin && chown -R nextjs:nodejs node_modules/.bin

# Verify Prisma client installation - CRITICAL CHECKS
RUN ls -la node_modules/@prisma/ || echo "⚠️  @prisma directory missing"
RUN ls -la node_modules/.prisma/ || echo "⚠️  .prisma directory missing"
RUN ls -la node_modules/prisma/ || echo "⚠️  prisma directory missing"

# Verify Prisma CLI is available in node_modules/.bin - MUST EXIST
RUN ls -la node_modules/.bin/ || echo "⚠️  .bin directory missing"
RUN ls -la node_modules/.bin/prisma && echo "✅ Prisma CLI found in .bin" || echo "❌ CRITICAL: prisma CLI not found in .bin"

USER nextjs

# Final verification as nextjs user - ensure the script is accessible and executable
RUN echo "=== FINAL VERIFICATION AS NEXTJS USER ===" && \
    ls -la /app/docker-entrypoint.sh && \
    test -x /app/docker-entrypoint.sh && echo "✅ Script is executable by nextjs user" || echo "❌ Script is NOT executable by nextjs user" && \
    test -r /app/docker-entrypoint.sh && echo "✅ Script is readable by nextjs user" || echo "❌ Script is NOT readable by nextjs user"

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Use ENTRYPOINT to run the initialization script
# The script has #!/bin/bash shebang and ends with "exec node server.js"
# This ensures proper process replacement and signal handling
# Using absolute path to avoid "no such file or directory" errors
ENTRYPOINT ["/app/docker-entrypoint.sh"]
