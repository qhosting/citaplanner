
#!/bin/sh

echo "🚨 EMERGENCY START - CITAPLANNER"
echo "Este script intenta iniciar la aplicación sin verificaciones de Prisma"

# Configure PATH
export PATH="$PATH:/app/node_modules/.bin"

# Verificar server.js
if [ ! -f "/app/server.js" ]; then
    echo "❌ ERROR: server.js no encontrado"
    echo "🔍 Buscando server.js..."
    find /app -name "server.js" -type f 2>/dev/null
    
    echo "🔄 Intentando con next start..."
    cd /app
    exec npx next start
    exit 1
fi

echo "✅ server.js encontrado"
echo "🚀 Iniciando servidor directamente..."

cd /app
exec node server.js
