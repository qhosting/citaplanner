#!/bin/bash

# Script de Solución de Migraciones de Prisma
# CitaPlanner - v1.0
# Autor: DeepAgent
# Fecha: 15 de Octubre, 2025

set -e

echo "=================================================="
echo "  CitaPlanner - Fix Migraciones Prisma"
echo "  Versión 1.0"
echo "=================================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función de log
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

# Función de validación de conexión a base de datos
check_database() {
    log_info "Verificando conexión a base de datos..."
    
    if npx prisma db pull --print > /dev/null 2>&1; then
        log_success "Conexión exitosa a la base de datos"
        return 0
    else
        log_error "Error de conexión a base de datos"
        log_warning "Verifica DATABASE_URL en las variables de entorno"
        return 1
    fi
}

# Función para verificar si Prisma CLI está disponible
check_prisma_cli() {
    log_info "Verificando Prisma CLI..."
    
    if command -v npx > /dev/null 2>&1; then
        log_success "Prisma CLI disponible"
        return 0
    else
        log_error "npx no encontrado. Instalando dependencias..."
        npm install
        return 1
    fi
}

# Función para crear backup de la tabla de migraciones (si existe)
backup_migrations_table() {
    log_info "Intentando crear backup de tabla _prisma_migrations..."
    
    # Este paso es opcional y requeriría acceso directo a la DB
    # Por seguridad, solo informamos al usuario
    log_warning "Asegúrate de tener un backup de la base de datos antes de continuar"
    log_warning "En Easypanel: Services > citaplanner-db > Backups"
}

# Lista de migraciones a aplicar
migrations=(
    "20241005_add_master_admin_config"
    "20251007193712_icalendar_integration"
    "20251007200241_phase1_system_configuration"
    "20251007204923_phase2_client_module"
    "20251007204938_phase2_client_module"
    "20251008005257_phase3_sales_module"
    "20251008190206_gender_enum_spanish"
    "20251009072859_notifications_system"
    "20251014_add_branch_assignments"
    "20251015_whatsapp_integration"
)

# Verificar Prisma CLI
check_prisma_cli

# Verificar conexión
if ! check_database; then
    log_error "No se puede continuar sin conexión a la base de datos"
    log_info "Verifica que DATABASE_URL esté configurado correctamente"
    exit 1
fi

echo ""
echo "=================================================="
log_info "Estado actual de migraciones:"
echo "=================================================="
npx prisma migrate status || true
echo ""
echo "=================================================="

# Información de seguridad
echo ""
backup_migrations_table
echo ""

# Confirmar acción
echo "=================================================="
log_warning "IMPORTANTE: Lee antes de continuar"
echo "=================================================="
echo ""
echo "Este script marcará ${#migrations[@]} migraciones como aplicadas."
echo "Esto es seguro SI Y SOLO SI:"
echo ""
echo "  1. ✅ Las tablas del esquema YA EXISTEN en la base de datos"
echo "  2. ✅ Tienes un backup reciente de la base de datos"
echo "  3. ✅ Has verificado que no faltan tablas o columnas"
echo ""
log_warning "NO continuar si:"
echo "  - ❌ La base de datos está vacía o parcialmente creada"
echo "  - ❌ Faltan tablas del esquema"
echo "  - ❌ No tienes backup de la base de datos"
echo ""
echo "=================================================="
echo ""

read -p "¿Has verificado lo anterior y deseas continuar? (escribe 'yes' para confirmar): " -r
echo ""

if [[ ! $REPLY =~ ^yes$ ]]; then
    log_warning "Operación cancelada por el usuario"
    log_info "Para continuar más tarde, ejecuta: ./fix-migrations.sh"
    exit 0
fi

# Aplicar baseline para cada migración
echo ""
echo "=================================================="
log_success "🚀 Iniciando proceso de baseline..."
echo "=================================================="
echo ""

success_count=0
fail_count=0
skipped_count=0

for migration in "${migrations[@]}"; do
    echo ""
    log_info "Procesando: $migration"
    
    # Verificar si la migración ya está aplicada
    if npx prisma migrate status 2>&1 | grep -q "$migration"; then
        migration_status=$(npx prisma migrate status 2>&1 | grep "$migration" || echo "")
        
        if echo "$migration_status" | grep -q "applied"; then
            log_warning "$migration ya está aplicada (omitiendo)"
            ((skipped_count++))
            continue
        fi
    fi
    
    # Intentar marcar como aplicada
    if npx prisma migrate resolve --applied "$migration" 2>&1; then
        log_success "$migration marcada como aplicada"
        ((success_count++))
    else
        log_error "Error al procesar $migration"
        ((fail_count++))
        
        # Preguntar si continuar con el resto
        echo ""
        read -p "¿Continuar con las migraciones restantes? (yes/no): " -n 3 -r
        echo ""
        
        if [[ ! $REPLY =~ ^yes$ ]]; then
            log_warning "Proceso detenido por el usuario"
            break
        fi
    fi
done

# Resumen
echo ""
echo "=================================================="
echo "  RESUMEN DEL PROCESO"
echo "=================================================="
echo ""
log_success "Migraciones exitosas: $success_count"
log_warning "Migraciones omitidas: $skipped_count"

if [ $fail_count -gt 0 ]; then
    log_error "Migraciones fallidas: $fail_count"
fi

echo ""
echo "=================================================="
echo ""

# Verificación final
echo "=================================================="
log_info "Estado final de migraciones:"
echo "=================================================="
npx prisma migrate status
echo ""
echo "=================================================="

# Regenerar cliente Prisma
echo ""
log_info "🔨 Regenerando cliente Prisma..."
if npx prisma generate; then
    log_success "Cliente Prisma regenerado exitosamente"
else
    log_error "Error al regenerar cliente Prisma"
    log_warning "Intenta manualmente: npx prisma generate"
fi
echo ""

# Mensaje final
if [ $fail_count -eq 0 ]; then
    echo "=================================================="
    log_success "🎉 Proceso completado exitosamente!"
    echo "=================================================="
    echo ""
    echo "✅ Próximos pasos:"
    echo ""
    echo "  1. Reiniciar la aplicación en Easypanel:"
    echo "     Services > citaplanner > Restart"
    echo ""
    echo "  2. Verificar logs de la aplicación:"
    echo "     Services > citaplanner > Logs"
    echo ""
    echo "  3. Probar funcionalidades críticas:"
    echo "     - Login de usuario"
    echo "     - Creación de citas"
    echo "     - Módulo de ventas/POS"
    echo "     - Notificaciones"
    echo "     - Integración WhatsApp"
    echo ""
    echo "  4. Verificar que no haya errores en:"
    echo "     - Consola del navegador"
    echo "     - Logs del servidor"
    echo "     - Base de datos"
    echo ""
    log_success "La aplicación debería funcionar correctamente ahora"
    echo ""
else
    echo "=================================================="
    log_warning "⚠️  Proceso completado con errores"
    echo "=================================================="
    echo ""
    log_error "Algunas migraciones fallaron ($fail_count)"
    echo ""
    echo "🔍 Pasos de troubleshooting:"
    echo ""
    echo "  1. Revisar el error específico arriba"
    echo ""
    echo "  2. Verificar que la tabla existe en la DB:"
    echo "     psql -U postgres -d citaplanner-db"
    echo "     \\dt+ <nombre_tabla>"
    echo ""
    echo "  3. Si la tabla NO existe, ejecutar la migración:"
    echo "     npx prisma migrate deploy"
    echo ""
    echo "  4. Si la tabla SÍ existe, intentar forzar resolve:"
    echo "     npx prisma migrate resolve --applied <migration_name>"
    echo ""
    echo "  5. Contactar soporte si el problema persiste"
    echo ""
fi

echo "=================================================="
log_info "Script finalizado"
echo "=================================================="
echo ""

# Salir con código apropiado
if [ $fail_count -eq 0 ]; then
    exit 0
else
    exit 1
fi
