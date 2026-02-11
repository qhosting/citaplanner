#!/bin/sh

echo "🚀 Iniciando CITAPLANNER (Easypanel Fix)..."

# Configurar PATH para incluir node_modules/.bin
export PATH="$PATH:/app/node_modules/.bin"

# Detectar comando Prisma
if [ -f "node_modules/.bin/prisma" ]; then
    PRISMA_CMD="node_modules/.bin/prisma"
else
    PRISMA_CMD="npx prisma"
fi

echo "🎯 Usando Prisma: $PRISMA_CMD"

# 1. Verificar variables de entorno críticas
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR FATAL: DATABASE_URL no está definida."
    exit 1
fi

# 2. Generar cliente
echo "📦 Generando cliente Prisma..."
$PRISMA_CMD generate

# 3. Intentar Sincronizar Base de Datos (DB Push)
echo "🔄 Intentando sincronizar base de datos (db push)..."
$PRISMA_CMD db push --accept-data-loss

if [ $? -ne 0 ]; then
    echo "❌ ERROR: Falló db push. Intentando migración..."
    # Fallback: intentar migrate deploy si db push falla (útil si hay migraciones pendientes)
    $PRISMA_CMD migrate deploy || echo "❌ Falló migrate deploy también."
else
    echo "✅ Base de datos sincronizada correctamente."
    
    # 4. Seed de datos (solo si la sincronización fue exitosa)
    # Intentamos ejecutar el seed definido en package.json o fallback directo
    echo "🌱 Ejecutando seed..."
    if grep -q '"seed":' package.json; then
        npm run seed || echo "⚠️  Seed falló (posiblemente datos ya existentes)."
    else
        $PRISMA_CMD db seed || echo "⚠️  Prisma seed falló."
    fi
fi

# 5. Ejecutar script de Superadmin si existe
if [ -f "scripts/create-superadmin-auto.ts" ]; then
    echo "👤 Intentando crear Superadmin por defecto..."
    npx tsx scripts/create-superadmin-auto.ts || echo "⚠️  No se pudo crear superadmin auto."
fi

# 6. Iniciar Servidor
echo "🚀 Iniciando servidor..."
if [ -f "server.js" ]; then
    exec node server.js
elif [ -f "/app/server.js" ]; then
    cd /app
    exec node server.js
else
    echo "❌ ERROR: server.js no encontrado. Iniciando npm start como fallback."
    exec npm start
fi
