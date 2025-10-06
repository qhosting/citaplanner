
#!/bin/sh
set -euo pipefail

echo "════════════════════════════════════════════════════════════════"
echo "🚀 CITAPLANNER - Sistema de Inicialización Automática"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Configurar PATH para incluir node_modules/.bin
export PATH="$PATH:/app/node_modules/.bin"

# Función para logging con timestamp
log_info() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ℹ️  $1"
}

log_success() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ✅ $1"
}

log_warning() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️  $1"
}

log_error() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $1"
}

log_debug() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] 🔍 $1"
}

# Validar y normalizar DATABASE_URL
validate_database_url() {
    log_info "Validando DATABASE_URL..."
    
    if [ -z "${DATABASE_URL:-}" ]; then
        log_error "DATABASE_URL no está configurada"
        return 1
    fi
    
    # Mostrar información de la URL (sin mostrar la contraseña completa)
    local masked_url=$(echo "$DATABASE_URL" | sed -E 's/(:[^:@]+)@/:*****@/')
    log_debug "DATABASE_URL configurada: $masked_url"
    
    # Validar formato básico de PostgreSQL URL
    if ! echo "$DATABASE_URL" | grep -qE '^postgres(ql)?://'; then
        log_error "DATABASE_URL no tiene formato válido de PostgreSQL"
        log_error "Formato esperado: postgresql://user:password@host:port/database"
        return 1
    fi
    
    # Extraer componentes de la URL para validación
    local db_user=$(echo "$DATABASE_URL" | sed -E 's|^postgres(ql)?://([^:]+):.*|\2|')
    local db_host=$(echo "$DATABASE_URL" | sed -E 's|^postgres(ql)?://[^@]+@([^:/]+).*|\2|')
    local db_port=$(echo "$DATABASE_URL" | sed -E 's|^postgres(ql)?://[^@]+@[^:]+:([0-9]+).*|\2|')
    local db_name=$(echo "$DATABASE_URL" | sed -E 's|^postgres(ql)?://[^/]+/([^?]+).*|\2|')
    
    log_debug "Usuario: $db_user"
    log_debug "Host: $db_host"
    log_debug "Puerto: $db_port"
    log_debug "Base de datos: $db_name"
    
    # Validar que los componentes no estén vacíos
    if [ -z "$db_user" ] || [ -z "$db_host" ] || [ -z "$db_port" ] || [ -z "$db_name" ]; then
        log_error "No se pudieron extraer todos los componentes de DATABASE_URL"
        return 1
    fi
    
    log_success "DATABASE_URL validada correctamente"
    return 0
}

# Detectar comando Prisma disponible
detect_prisma_cmd() {
    if [ -f "node_modules/.bin/prisma" ]; then
        log_success "Prisma CLI encontrado en node_modules/.bin/prisma"
        echo "node_modules/.bin/prisma"
    elif [ -f "node_modules/prisma/build/index.js" ]; then
        log_warning "Usando Prisma directamente desde build/index.js"
        echo "node node_modules/prisma/build/index.js"
    else
        log_warning "Prisma CLI no encontrado - usando npx"
        echo "npx prisma"
    fi
}

# Verificar conexión a la base de datos usando psql
check_database_connection_psql() {
    log_info "Verificando conectividad con PostgreSQL usando psql..."
    
    # Extraer componentes de DATABASE_URL
    local db_user=$(echo "$DATABASE_URL" | sed -E 's|^postgres(ql)?://([^:]+):.*|\2|')
    local db_pass=$(echo "$DATABASE_URL" | sed -E 's|^postgres(ql)?://[^:]+:([^@]+)@.*|\2|')
    local db_host=$(echo "$DATABASE_URL" | sed -E 's|^postgres(ql)?://[^@]+@([^:/]+).*|\2|')
    local db_port=$(echo "$DATABASE_URL" | sed -E 's|^postgres(ql)?://[^@]+@[^:]+:([0-9]+).*|\2|')
    local db_name=$(echo "$DATABASE_URL" | sed -E 's|^postgres(ql)?://[^/]+/([^?]+).*|\2|')
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        log_debug "Intento $attempt/$max_attempts - Conectando a PostgreSQL..."
        
        # Intentar conexión con psql
        if PGPASSWORD="$db_pass" psql -h "$db_host" -p "$db_port" -U "$db_user" -d "$db_name" -c "SELECT 1;" > /dev/null 2>&1; then
            log_success "Conexión a PostgreSQL establecida correctamente"
            return 0
        fi
        
        if [ $attempt -lt $max_attempts ]; then
            log_warning "Esperando a que PostgreSQL esté disponible... ($attempt/$max_attempts)"
            sleep 2
        fi
        
        attempt=$((attempt + 1))
    done
    
    log_error "No se pudo conectar a PostgreSQL después de $max_attempts intentos"
    log_error "Verifica que:"
    log_error "  1. El servidor PostgreSQL esté ejecutándose"
    log_error "  2. Las credenciales sean correctas"
    log_error "  3. El host y puerto sean accesibles"
    log_error "  4. La base de datos exista"
    return 1
}

# Verificar conexión a la base de datos usando Prisma
check_database_connection() {
    log_info "Verificando conexión con Prisma..."
    
    if [ -z "${DATABASE_URL:-}" ]; then
        log_error "DATABASE_URL no está configurada"
        return 1
    fi
    
    # Intentar conectar con Prisma
    local max_attempts=5
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        log_debug "Intento $attempt/$max_attempts - Verificando con Prisma..."
        
        if eval "$PRISMA_CMD db execute --stdin" <<EOF > /dev/null 2>&1
SELECT 1;
EOF
        then
            log_success "Prisma puede conectarse a la base de datos"
            return 0
        fi
        
        if [ $attempt -lt $max_attempts ]; then
            log_warning "Reintentando conexión con Prisma... ($attempt/$max_attempts)"
            sleep 2
        fi
        
        attempt=$((attempt + 1))
    done
    
    log_warning "Prisma no pudo verificar la conexión, pero continuaremos"
    return 0
}

# Ejecutar migraciones de Prisma
run_migrations() {
    log_info "Ejecutando migraciones de Prisma..."
    
    # Primero intentar migrate deploy (recomendado para producción)
    log_debug "Intentando migrate deploy..."
    if eval "$PRISMA_CMD migrate deploy" 2>&1 | tee /tmp/migrate-deploy.log; then
        log_success "Migraciones aplicadas correctamente con migrate deploy"
        return 0
    else
        log_warning "migrate deploy falló, intentando con db push..."
        
        # Fallback a db push si migrate deploy falla
        log_debug "Intentando db push..."
        if eval "$PRISMA_CMD db push --accept-data-loss --skip-generate" 2>&1 | tee /tmp/db-push.log; then
            log_success "Esquema de base de datos sincronizado correctamente con db push"
            return 0
        else
            log_error "Error al aplicar migraciones con ambos métodos"
            log_error "Revisa los logs en /tmp/migrate-deploy.log y /tmp/db-push.log"
            return 1
        fi
    fi
}

# Generar cliente Prisma
generate_prisma_client() {
    log_info "Generando cliente Prisma..."
    
    if eval "$PRISMA_CMD generate" 2>&1 | tee /tmp/prisma-generate.log; then
        log_success "Cliente Prisma generado correctamente"
        
        # Verificar que el cliente se generó correctamente
        if [ -d "node_modules/.prisma/client" ]; then
            log_success "Cliente Prisma verificado en node_modules/.prisma/client"
        else
            log_warning "Cliente Prisma generado pero no encontrado en ubicación esperada"
        fi
        
        return 0
    else
        log_error "Error al generar cliente Prisma"
        log_error "Revisa el log en /tmp/prisma-generate.log"
        return 1
    fi
}

# Verificar si la base de datos está vacía
is_database_empty() {
    log_info "Verificando si la base de datos necesita seed..."
    
    # Verificar si la tabla users existe y tiene datos
    local user_count
    user_count=$(eval "$PRISMA_CMD db execute --stdin" <<EOF 2>/dev/null | tail -n 1 | tr -d ' '
SELECT COUNT(*) FROM users;
EOF
)
    
    if [ -z "$user_count" ] || [ "$user_count" = "0" ]; then
        log_info "Base de datos vacía - se ejecutará el seed"
        return 0
    else
        log_info "Base de datos contiene $user_count usuarios - seed no necesario"
        return 1
    fi
}

# Ejecutar seed de datos
run_seed() {
    log_info "Ejecutando seed de datos de ejemplo..."
    
    # Verificar que el script de seed existe
    if [ ! -f "scripts/seed.ts" ]; then
        log_error "Script de seed no encontrado en scripts/seed.ts"
        return 1
    fi
    
    # Ejecutar seed usando el comando definido en package.json
    if npm run prisma db seed 2>&1; then
        log_success "Seed ejecutado correctamente"
        log_info "═══════════════════════════════════════════════════════"
        log_info "📋 Datos de ejemplo creados:"
        log_info "   • 1 Empresa: Bella Vita Spa & Wellness"
        log_info "   • 1 Sucursal: Sucursal Centro"
        log_info "   • 5 Usuarios (Admin, Manager, 2 Profesionales, Recepcionista)"
        log_info "   • 6 Servicios"
        log_info "   • 6 Clientes"
        log_info "   • 6 Citas de ejemplo"
        log_info "   • 3 Pagos registrados"
        log_info ""
        log_info "🔑 Credenciales de acceso:"
        log_info "   Admin: admin@citaplanner.com / admin123"
        log_info "   Manager: manager@citaplanner.com / manager123"
        log_info "   Profesional 1: pro1@citaplanner.com / prof123"
        log_info "   Profesional 2: pro2@citaplanner.com / prof123"
        log_info "   Recepcionista: recepcionista@citaplanner.com / prof123"
        log_info "═══════════════════════════════════════════════════════"
        return 0
    else
        log_warning "Error al ejecutar seed (puede ser normal si ya hay datos)"
        return 1
    fi
}

# Configurar master password inicial
configure_master_password() {
    log_info "Verificando configuración del Master Admin..."
    
    # Verificar si ya existe configuración de master admin
    local config_exists
    config_exists=$(eval "$PRISMA_CMD db execute --stdin" <<EOF 2>/dev/null | tail -n 1 | tr -d ' '
SELECT COUNT(*) FROM master_admin_config WHERE id = 'singleton';
EOF
)
    
    if [ -n "$config_exists" ] && [ "$config_exists" != "0" ]; then
        log_info "Configuración de Master Admin ya existe - omitiendo"
        return 0
    fi
    
    log_info "Creando configuración inicial del Master Admin..."
    
    # Hash por defecto para el password: x0420EZS2025*
    # Este hash fue generado con bcryptjs y es compatible
    local default_hash='$2b$10$P/AV363LeWhZGK0kkrON3eGmAlkmiTHKuzZzDKCAppFV.0Gzf0ZaO'
    
    # Usar variable de entorno si está disponible, sino usar el hash por defecto
    local master_hash="${MASTER_PASSWORD_HASH:-$default_hash}"
    
    # Insertar configuración en la base de datos
    if eval "$PRISMA_CMD db execute --stdin" <<EOF 2>&1
INSERT INTO master_admin_config (id, password_hash, created_at, updated_at, last_password_change) 
VALUES ('singleton', '$master_hash', NOW(), NOW(), NOW()) 
ON CONFLICT (id) DO NOTHING;
EOF
    then
        log_success "Configuración de Master Admin creada correctamente"
        log_info "═══════════════════════════════════════════════════════"
        log_info "🔐 Master Admin Panel configurado"
        log_info "   URL: https://citaplanner.com/admin/master"
        log_info "   Password por defecto: x0420EZS2025*"
        log_info ""
        log_warning "⚠️  IMPORTANTE: Cambia el password después del primer login"
        log_info "═══════════════════════════════════════════════════════"
        return 0
    else
        log_error "Error al crear configuración de Master Admin"
        return 1
    fi
}

# Verificar archivos necesarios para Next.js
verify_nextjs_files() {
    log_info "Verificando archivos de Next.js standalone..."
    
    if [ ! -f "/app/server.js" ]; then
        log_error "server.js no encontrado en /app/server.js"
        log_info "Estructura del directorio /app:"
        ls -la /app/ | head -20
        return 1
    fi
    
    log_success "Archivos de Next.js verificados correctamente"
    return 0
}

# ═══════════════════════════════════════════════════════════════════
# PROCESO PRINCIPAL DE INICIALIZACIÓN
# ═══════════════════════════════════════════════════════════════════

main() {
    log_info "Iniciando proceso de inicialización..."
    echo ""
    
    # 1. Validar DATABASE_URL
    if ! validate_database_url; then
        log_error "DATABASE_URL no es válida - no se puede continuar"
        log_error "Asegúrate de configurar DATABASE_URL correctamente"
        log_error "Formato: postgresql://user:password@host:port/database"
        exit 1
    fi
    echo ""
    
    # 2. Detectar comando Prisma
    PRISMA_CMD=$(detect_prisma_cmd)
    log_info "Comando Prisma: $PRISMA_CMD"
    echo ""
    
    # 3. Verificar conexión a PostgreSQL usando psql
    if ! check_database_connection_psql; then
        log_error "No se pudo establecer conexión con PostgreSQL"
        log_error "Verifica la configuración de DATABASE_URL y que PostgreSQL esté ejecutándose"
        exit 1
    fi
    echo ""
    
    # 4. Verificar conexión con Prisma
    check_database_connection
    echo ""
    
    # 5. Ejecutar migraciones
    if run_migrations; then
        echo ""
        
        # 6. Generar cliente Prisma
        if generate_prisma_client; then
            echo ""
            
            # 7. Verificar si necesita seed (solo si la BD está vacía)
            if is_database_empty; then
                echo ""
                run_seed
                echo ""
            fi
            
            # 8. Configurar master password (idempotente)
            configure_master_password
            echo ""
        else
            log_error "Error al generar cliente Prisma - no se puede continuar"
            exit 1
        fi
    else
        log_error "Error en migraciones - no se puede continuar"
        log_error "Revisa los logs de migración para más detalles"
        exit 1
    fi
    
    # 9. Verificar archivos de Next.js
    echo ""
    if ! verify_nextjs_files; then
        log_error "Archivos de Next.js no encontrados - no se puede iniciar"
        exit 1
    fi
    
    # 10. Iniciar aplicación Next.js
    echo ""
    log_success "Inicialización completada exitosamente - iniciando aplicación..."
    echo "════════════════════════════════════════════════════════════════"
    echo "🎯 Iniciando servidor Next.js standalone"
    echo "   📂 Working directory: /app"
    echo "   📄 Server: /app/server.js"
    echo "   🌐 Hostname: 0.0.0.0"
    echo "   🔌 Port: 3000"
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    
    cd /app || {
        log_error "No se puede cambiar al directorio /app"
        exit 1
    }
    
    # Ejecutar servidor Next.js
    exec node server.js
}

# Ejecutar función principal
main
