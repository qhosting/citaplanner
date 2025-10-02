
#!/bin/bash

# Script para generar información de versión en tiempo de build
# Este script captura el commit SHA y la fecha de build

set -e  # Exit on error, but we'll handle errors explicitly

echo "🔧 Generando información de versión..."

# Obtener el commit SHA actual
# Verificar si git está disponible y si estamos en un repositorio git
if command -v git >/dev/null 2>&1 && git rev-parse --git-dir >/dev/null 2>&1; then
  GIT_COMMIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
  echo "   ✓ Git disponible - SHA: $GIT_COMMIT_SHA"
else
  GIT_COMMIT_SHA="unknown"
  echo "   ⚠ Git no disponible o no es un repositorio git - usando SHA: unknown"
fi

# Obtener la fecha de build en formato ISO 8601
BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || echo "unknown")

# Obtener la versión del package.json (si existe)
if [ -f "package.json" ]; then
  APP_VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "1.0.0")
else
  APP_VERSION="1.0.0"
  echo "   ⚠ package.json no encontrado - usando versión por defecto: 1.0.0"
fi

# Crear o actualizar el archivo .env.local con la información de versión
ENV_FILE=".env.local"

echo "📝 Actualizando $ENV_FILE con información de versión..."

# Crear backup si el archivo existe
if [ -f "$ENV_FILE" ]; then
  cp "$ENV_FILE" "$ENV_FILE.backup" 2>/dev/null || true
fi

# Remover líneas existentes de versión si existen
if [ -f "$ENV_FILE" ]; then
  grep -v "^APP_VERSION=" "$ENV_FILE" 2>/dev/null | grep -v "^GIT_COMMIT_SHA=" | grep -v "^BUILD_DATE=" > "$ENV_FILE.tmp" || touch "$ENV_FILE.tmp"
  mv "$ENV_FILE.tmp" "$ENV_FILE"
fi

# Agregar nueva información de versión
{
  echo ""
  echo "# Build version information (auto-generated)"
  echo "APP_VERSION=$APP_VERSION"
  echo "GIT_COMMIT_SHA=$GIT_COMMIT_SHA"
  echo "BUILD_DATE=$BUILD_DATE"
} >> "$ENV_FILE"

echo "✅ Información de versión generada exitosamente:"
echo "   - Versión: $APP_VERSION"
echo "   - Commit SHA: $GIT_COMMIT_SHA"
echo "   - Fecha de build: $BUILD_DATE"
echo "   - Archivo: $ENV_FILE"
echo ""

# Asegurar que el script siempre termine exitosamente
exit 0
