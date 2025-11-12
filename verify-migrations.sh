#!/bin/bash

# Script de Verificación de Migraciones de Prisma
# CitaPlanner - v1.0
# Autor: DeepAgent
# Fecha: 15 de Octubre, 2025

echo "=================================================="
echo "  CitaPlanner - Verificación de Migraciones"
echo "  Versión 1.0"
echo "=================================================="
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

echo "=================================================="
log_info "1. Verificando Entorno"
echo "=================================================="
echo ""

# Verificar Node.js
log_info "Node.js version:"
node --version

# Verificar npm
log_info "npm version:"
npm --version

# Verificar Prisma
log_info "Prisma CLI:"
npx prisma --version | head -5

echo ""
echo "=================================================="
log_info "2. Verificando Variables de Entorno"
echo "=================================================="
echo ""

# Verificar DATABASE_URL (sin mostrar la URL completa por seguridad)
if [ -z "$DATABASE_URL" ]; then
    log_error "DATABASE_URL no está configurada"
else
    log_success "DATABASE_URL está configurada"
    # Mostrar solo el tipo de base de datos
    db_type=$(echo $DATABASE_URL | cut -d':' -f1)
    log_info "Tipo de base de datos: $db_type"
fi

echo ""
echo "=================================================="
log_info "3. Verificando Archivos de Prisma"
echo "=================================================="
echo ""

# Verificar schema.prisma
if [ -f "prisma/schema.prisma" ]; then
    log_success "schema.prisma encontrado"
    log_info "Tamaño: $(wc -l prisma/schema.prisma | awk '{print $1}') líneas"
else
    log_error "schema.prisma NO encontrado"
fi

# Verificar directorio de migraciones
if [ -d "prisma/migrations" ]; then
    log_success "Directorio de migraciones encontrado"
    migration_count=$(ls -1 prisma/migrations | grep -v "migration_lock.toml" | wc -l)
    log_info "Número de migraciones: $migration_count"
    echo ""
    log_info "Lista de migraciones:"
    ls -1 prisma/migrations | grep -v "migration_lock.toml" | while read migration; do
        echo "  - $migration"
    done
else
    log_error "Directorio de migraciones NO encontrado"
fi

echo ""
echo "=================================================="
log_info "4. Verificando Conexión a Base de Datos"
echo "=================================================="
echo ""

# Intentar conectar
if npx prisma db pull --print > /tmp/db_schema.txt 2>&1; then
    log_success "Conexión exitosa a la base de datos"
    
    # Contar modelos en el esquema
    model_count=$(grep -c "^model " /tmp/db_schema.txt 2>/dev/null || echo "0")
    log_info "Modelos detectados: $model_count"
    
    rm -f /tmp/db_schema.txt
else
    log_error "No se pudo conectar a la base de datos"
    log_warning "Verifica DATABASE_URL y que el servicio de DB esté activo"
fi

echo ""
echo "=================================================="
log_info "5. Estado de Migraciones de Prisma"
echo "=================================================="
echo ""

# Ejecutar prisma migrate status
migration_status=$(npx prisma migrate status 2>&1)
echo "$migration_status"

echo ""
echo "=================================================="
log_info "6. Análisis del Estado"
echo "=================================================="
echo ""

# Analizar el estado
if echo "$migration_status" | grep -q "Database schema is up to date"; then
    log_success "✅ ESTADO: Base de datos actualizada"
    log_success "No se requiere acción adicional"
    
elif echo "$migration_status" | grep -q "P3005"; then
    log_error "❌ ESTADO: Error P3005 - Base de datos no vacía"
    log_warning "Se requiere baseline de migraciones"
    echo ""
    echo "📋 ACCIÓN REQUERIDA:"
    echo ""
    echo "Ejecuta el script de solución:"
    echo "  ./fix-migrations.sh"
    echo ""
    echo "O marca las migraciones manualmente:"
    echo "  npx prisma migrate resolve --applied <migration_name>"
    
elif echo "$migration_status" | grep -q "pending"; then
    log_warning "⚠️  ESTADO: Migraciones pendientes"
    echo ""
    echo "📋 ACCIÓN REQUERIDA:"
    echo ""
    echo "Aplica las migraciones pendientes:"
    echo "  npx prisma migrate deploy"
    
else
    log_warning "⚠️  ESTADO: No se pudo determinar"
    log_info "Revisa la salida de 'prisma migrate status' arriba"
fi

echo ""
echo "=================================================="
log_info "7. Verificando Tablas Críticas"
echo "=================================================="
echo ""

# Lista de tablas críticas que deberían existir
critical_tables=(
    "tenants"
    "users"
    "branches"
    "appointments"
    "clients"
    "services"
    "notifications"
    "notification_logs"
    "branch_assignments"
    "whatsapp_configs"
    "whatsapp_logs"
    "message_templates"
    "reminder_logs"
    "master_admin_config"
)

log_info "Tablas críticas esperadas:"
for table in "${critical_tables[@]}"; do
    echo "  - $table"
done

echo ""
log_warning "Para verificar en la base de datos, ejecuta:"
echo "  docker exec -it <db-container> psql -U postgres -d citaplanner-db -c '\\dt'"

echo ""
echo "=================================================="
log_info "8. Validación de Esquema"
echo "=================================================="
echo ""

# Validar esquema de Prisma
if npx prisma validate 2>&1; then
    log_success "Esquema de Prisma es válido"
else
    log_error "Esquema de Prisma tiene errores"
    log_warning "Revisa el archivo prisma/schema.prisma"
fi

echo ""
echo "=================================================="
log_info "9. Información del Cliente Prisma"
echo "=================================================="
echo ""

# Verificar si el cliente está generado
if [ -d "node_modules/.prisma/client" ]; then
    log_success "Cliente Prisma generado"
else
    log_warning "Cliente Prisma NO generado"
    log_info "Ejecuta: npx prisma generate"
fi

echo ""
echo "=================================================="
log_info "10. Resumen y Recomendaciones"
echo "=================================================="
echo ""

# Determinar si hay problemas
has_issues=false

# Verificar problemas
if echo "$migration_status" | grep -q "P3005"; then
    has_issues=true
fi

if echo "$migration_status" | grep -q "pending"; then
    has_issues=true
fi

if [ -z "$DATABASE_URL" ]; then
    has_issues=true
fi

# Resumen final
if [ "$has_issues" = true ]; then
    echo "=================================================="
    log_warning "⚠️  SE DETECTARON PROBLEMAS"
    echo "=================================================="
    echo ""
    echo "📋 PASOS RECOMENDADOS:"
    echo ""
    echo "1. Lee el documento completo de solución:"
    echo "   cat SOLUCION_MIGRACIONES_PRISMA.md"
    echo ""
    echo "2. Crea un backup de la base de datos"
    echo ""
    echo "3. Ejecuta el script de solución:"
    echo "   ./fix-migrations.sh"
    echo ""
    echo "4. Reinicia la aplicación"
    echo ""
    echo "5. Ejecuta este script nuevamente para verificar:"
    echo "   ./verify-migrations.sh"
    echo ""
else
    echo "=================================================="
    log_success "✅ TODO PARECE ESTAR EN ORDEN"
    echo "=================================================="
    echo ""
    log_info "La base de datos y las migraciones están correctamente configuradas"
    echo ""
    echo "✅ Próximos pasos:"
    echo "  - Verificar que la aplicación funcione correctamente"
    echo "  - Probar funcionalidades críticas"
    echo "  - Monitorear logs por errores"
    echo ""
fi

echo "=================================================="
log_info "Verificación Completada"
echo "=================================================="
echo ""
echo "📄 Para más información, consulta:"
echo "  - SOLUCION_MIGRACIONES_PRISMA.md (documentación completa)"
echo "  - GUIA_RAPIDA_EASYPANEL_MIGRACIONES.md (guía paso a paso)"
echo ""
echo "=================================================="
echo ""
