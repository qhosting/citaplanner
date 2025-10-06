# syntax=docker.io/docker/dockerfile:1

FROM node:20-bookworm-slim AS base
LABEL fly_launch_runtime="Remix"

# Install necessary packages
RUN apt-get update && apt-get install -y \
    ca-certificates \
    fuse3 \
    openssl \
    postgresql-client \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies
# Note: Using --legacy-peer-deps to resolve TypeScript ESLint peer dependency conflict
# between @typescript-eslint/parser@7.0.0 and @typescript-eslint/eslint-plugin@7.0.0
# which expects parser@^6.0.0. This is a temporary solution until package versions are synchronized.
RUN --mount=type=cache,target=/root/.npm \
    npm ci --legacy-peer-deps --production=false

FROM base

# Copy application code
COPY --link . .

# Build the application
RUN npm run build

# Prepare production environment
RUN npm prune --omit=dev

# Setup user and permissions
RUN useradd -ms /bin/bash -u 1001 appuser && \
    mkdir -p /data && \
    chown -R appuser:appuser /data /app

USER appuser

# Make entrypoint executable
RUN chmod +x /app/docker-entrypoint.sh

# Expose port
EXPOSE 8080

# Set entrypoint
ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["npm", "run", "start"]
