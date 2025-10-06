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

# Set working directory
WORKDIR /app

# Copy package files first for dependency installation
# Note: The app uses Yarn, not npm. yarn.lock is in the app/ subdirectory.
COPY --link app/package.json app/yarn.lock ./app/

# Install dependencies using Yarn
# The project uses Yarn (yarn.lock exists), not npm/package-lock.json
WORKDIR /app/app
RUN --mount=type=cache,target=/root/.yarn \
    yarn install --frozen-lockfile

# Copy application code
WORKDIR /app
COPY --link . .

# Build the application
WORKDIR /app/app
RUN yarn build

# Prepare production environment
RUN yarn install --production --frozen-lockfile

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
CMD ["yarn", "start"]
