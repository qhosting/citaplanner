
# Multi-stage build optimizado para Easypanel
FROM node:18-alpine AS base

# Instalar dependencias necesarias para Prisma y Alpine
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Configurar npm para usar cache
ENV NPM_CONFIG_CACHE=/app/.npm-cache

# ============================================
# Stage 1: Instalar dependencias
# ============================================
FROM base AS deps
COPY app/package.json app/package-lock.json* ./
RUN --mount=type=cache,target=/app/.npm-cache \
    npm ci --legacy-peer-deps --ignore-scripts

# ============================================
# Stage 2: Build de la aplicación
# ============================================
FROM base AS builder
WORKDIR /app

# Copiar dependencias instaladas
COPY --from=deps /app/node_modules ./node_modules

# Copiar código fuente
COPY app/ .

# Generar cliente Prisma
RUN npx prisma generate

# Build de Next.js con standalone output
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN echo "🏗️  Building Next.js with standalone output..." && \
    npm run build && \
    echo "✅ Build completed successfully"

# Verificar que standalone fue creado correctamente
RUN if [ ! -d ".next/standalone" ]; then \
        echo "❌ ERROR: Standalone directory not created!"; \
        ls -la .next/; \
        exit 1; \
    fi && \
    echo "✅ Standalone build verified"

# ============================================
# Stage 3: Copiar archivos públicos desde root
# ============================================
FROM base AS public-files
WORKDIR /app
# Copiar directorio public desde la raíz del repositorio
COPY public ./public

# ============================================
# Stage 4: Imagen de producción
# ============================================
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Crear usuario no-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copiar archivos públicos desde el stage public-files
COPY --from=public-files /app/public ./public

# Crear directorio .next con permisos correctos
RUN mkdir .next && chown nextjs:nodejs .next

# Copiar el build standalone
# IMPORTANTE: Next.js standalone crea estructura app/* por outputFileTracingRoot
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone/app ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copiar archivos de Prisma con permisos correctos
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.bin ./node_modules/.bin

# Copy scripts folder for seed execution
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts

# Copy essential node_modules for seed execution (bcryptjs, tsx, etc.)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/bcryptjs ./node_modules/bcryptjs
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/tsx ./node_modules/tsx
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/dotenv ./node_modules/dotenv
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/typescript ./node_modules/typescript

# Copiar scripts de inicio
COPY --chown=nextjs:nodejs start.sh ./
RUN chmod +x start.sh

# Crear directorios con permisos correctos
RUN mkdir -p node_modules/.prisma node_modules/@prisma node_modules/.bin && \
    chown -R nextjs:nodejs node_modules/.prisma node_modules/@prisma node_modules/.bin

# Verificar instalación de Prisma
RUN echo "🔍 Verificando instalación de Prisma..." && \
    ls -la node_modules/.bin/prisma && echo "✅ Prisma CLI encontrado" || echo "⚠️  Prisma CLI no encontrado"

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Iniciar aplicación
CMD ["./start.sh"]
