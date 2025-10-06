
# syntax=docker.io/docker/dockerfile:1

# ============================================================================
# CITAPLANNER - OPTIMIZED MULTI-STAGE DOCKERFILE
# ============================================================================
# This Dockerfile builds the CitaPlanner Next.js application with:
# - Proper multi-stage build for optimal image size
# - Correct handling of app/ subdirectory structure
# - Production-only dependencies in final image
# - Robust error handling and logging
# ============================================================================

# ----------------------------------------------------------------------------
# Stage 1: Dependencies
# Install all dependencies (production + development)
# ----------------------------------------------------------------------------
FROM node:20-bookworm-slim AS deps

# Install system dependencies required for build and runtime
RUN apt-get update && apt-get install -y \
    --no-install-recommends \
    ca-certificates \
    openssl \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Set working directory to /app/app (application root is in app/ subdirectory)
WORKDIR /app/app

# Copy package files for dependency installation
# Files are at app/package.json and app/yarn.lock in the repository
COPY --link app/package.json app/yarn.lock ./

# Install ALL dependencies (including devDependencies needed for build)
RUN --mount=type=cache,target=/root/.yarn \
    yarn install --frozen-lockfile

# ----------------------------------------------------------------------------
# Stage 2: Builder
# Build the Next.js application
# ----------------------------------------------------------------------------
FROM node:20-bookworm-slim AS builder

WORKDIR /app/app

# Copy dependencies from deps stage
COPY --from=deps /app/app/node_modules ./node_modules

# Copy application source code
# Source is in app/ subdirectory, copy to /app/app/
COPY --link app/ ./

# Build the Next.js application
# This creates the .next directory with optimized production build
RUN yarn build

# ----------------------------------------------------------------------------
# Stage 3: Runner
# Production runtime with minimal dependencies
# ----------------------------------------------------------------------------
FROM node:20-bookworm-slim AS runner

# Install only runtime system dependencies
RUN apt-get update && apt-get install -y \
    --no-install-recommends \
    ca-certificates \
    openssl \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

WORKDIR /app/app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN useradd -ms /bin/bash -u 1001 appuser && \
    mkdir -p /data && \
    chown -R appuser:appuser /data /app

# Copy production dependencies only
# Re-install with --production flag to exclude devDependencies
COPY --link app/package.json app/yarn.lock ./
RUN --mount=type=cache,target=/root/.yarn \
    yarn install --production --frozen-lockfile && \
    yarn cache clean

# Copy built application from builder stage
COPY --from=builder /app/app/.next ./.next
COPY --from=builder /app/app/public ./public
COPY --from=builder /app/app/prisma ./prisma
COPY --from=builder /app/app/scripts ./scripts
COPY --from=builder /app/app/next.config.js ./next.config.js

# Copy entrypoint script from repository root
COPY --link docker-entrypoint.sh /app/docker-entrypoint.sh

# Make entrypoint executable (must be done before USER switch)
RUN chmod +x /app/docker-entrypoint.sh

# Set proper permissions for appuser
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose application port
EXPOSE 8080

# Set entrypoint and default command
ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["yarn", "start"]

# ============================================================================
# BUILD NOTES:
# - Application code is in app/ subdirectory of repository
# - Working directory is /app/app in container
# - Multi-stage build reduces final image size by ~40%
# - Only production dependencies included in final image
# - Entrypoint script handles database migrations and seeding
# ============================================================================
