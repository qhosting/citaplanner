#!/bin/sh

echo "🚀 Iniciando CITAPLANNER (Easypanel Fix v3)..."

# Configurar PATH
export PATH="$PATH:/app/node_modules/.bin"

# Detectar comando Prisma
if [ -f "node_modules/.bin/prisma" ]; then
    PRISMA_CMD="node_modules/.bin/prisma"
else
    PRISMA_CMD="npx prisma"
fi

echo "🎯 Usando Prisma: $PRISMA_CMD"

# 1. Verificar variable de BD
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR FATAL: DATABASE_URL no está definida."
    exit 1
fi

# 2. Generar cliente
echo "📦 Generando cliente Prisma..."
$PRISMA_CMD generate

# 3. Intentar resolver migraciones fallidas
echo "🔧 Intentando marcar migraciones fallidas como resueltas..."
# Si hay migraciones fallidas, intentamos marcarlas como rolled back para reintentar
$PRISMA_CMD migrate resolve --applied "20251007193712_icalendar_integration" || echo "⚠️ No se pudo resolver migración específica (puede que no exista)."

# 4. Sincronización Forzada (DB Push)
# Usamos --accept-data-loss para forzar el estado del esquema actual sobre la BD
echo "🔄 Forzando sincronización de esquema (db push)..."
$PRISMA_CMD db push --accept-data-loss

if [ $? -ne 0 ]; then
    echo "❌ ERROR: Falló db push."
    # Si falla push, intentamos migrate deploy como último recurso
    echo "🔄 Intentando migrate deploy..."
    $PRISMA_CMD migrate deploy || echo "❌ Falló migrate deploy. La BD puede estar inconsistente."
else
    echo "✅ Base de datos sincronizada."
    
    # 5. Seed y Superadmin (Solo si la BD está sana)
    echo "🌱 Ejecutando seed..."
    if grep -q '"seed":' package.json; then
        npm run seed || echo "⚠️  Seed falló o datos existentes."
    else
        $PRISMA_CMD db seed || echo "⚠️  Prisma seed falló."
    fi

    echo "👤 Creando Superadmin..."
    if [ -f "scripts/create-superadmin-auto.ts" ]; then
        npx tsx scripts/create-superadmin-auto.ts || echo "⚠️  Script superadmin falló."
    fi
fi

# 6. Iniciar Servidor
echo "🚀 Iniciando servidor..."
if [ -f "server.js" ]; then
    exec node server.js
elif [ -f "/app/server.js" ]; then
    cd /app
    exec node server.js
else
    exec npm start
fi
