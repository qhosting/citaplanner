#!/bin/sh

echo "🚀 Iniciando CITAPLANNER (Start Script Modificado)..."

# Configurar PATH
export PATH="$PATH:/app/node_modules/.bin"

# Detectar comando Prisma
if [ -f "node_modules/.bin/prisma" ]; then
    PRISMA_CMD="node_modules/.bin/prisma"
else
    PRISMA_CMD="npx prisma"
fi

echo "🎯 Usando Prisma: $PRISMA_CMD"

# 1. Generar cliente (siempre seguro de ejecutar)
echo "📦 Generando cliente Prisma..."
$PRISMA_CMD generate

# 2. Intentar aplicar migraciones a la BD
echo "🔄 Sincronizando base de datos (db push)..."
# Quitamos --force-reset para no borrar datos en prod
# Usamos --accept-data-loss con precaución (necesario si hay cambios de esquema destructivos)
$PRISMA_CMD db push --accept-data-loss

if [ $? -ne 0 ]; then
    echo "❌ ERROR CRÍTICO: Falló prisma db push."
    echo "⚠️  La aplicación intentará iniciar, pero pueden faltar tablas."
else
    echo "✅ Base de datos sincronizada correctamente."
    
    # 3. Seed de datos (solo si la DB se sincronizó bien)
    echo "🌱 Ejecutando seed..."
    $PRISMA_CMD db seed || echo "⚠️  Seed falló o ya existen datos."
fi

# 4. Verificar existencia de server.js
if [ ! -f "server.js" ] && [ ! -f "/app/server.js" ]; then
    echo "❌ ERROR: server.js no encontrado."
    exit 1
fi

# 5. Iniciar Servidor
echo "🚀 Iniciando servidor Node.js..."
if [ -f "server.js" ]; then
    exec node server.js
else
    cd /app
    exec node server.js
fi
