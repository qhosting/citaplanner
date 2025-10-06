
#!/bin/sh
set -e

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

# Verificar conexión a la base de datos
check_database_connection() {
    log_info "Verificando conexión a la base de datos..."
    
    if [ -z "$DATABASE_URL" ]; then
        log_error "DATABASE_URL no está configurada"
        return 1
    fi
    
    # Intentar conectar con un timeout
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if echo "SELECT 1;" | $PRISMA_CMD db execute --stdin > /dev/null 2>&1; then
            log_success "Conexión a la base de datos establecida"
            return 0
        fi
        
        log_warning "Intento $attempt/$max_attempts - Esperando conexión a la base de datos..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    log_error "No se pudo conectar a la base de datos después de $max_attempts intentos"
    return 1
}

# Ejecutar migraciones de Prisma
run_migrations() {
    log_info "Ejecutando migraciones de Prisma..."
    
    # Usar db push para sincronizar el esquema (más seguro para producción)
    if $PRISMA_CMD db push --accept-data-loss --skip-generate 2>&1; then
        log_success "Esquema de base de datos sincronizado correctamente"
        return 0
    else
        log_warning "Error al sincronizar esquema, intentando con migrate deploy..."
        
        # Fallback a migrate deploy si db push falla
        if $PRISMA_CMD migrate deploy 2>&1; then
            log_success "Migraciones aplicadas correctamente"
            return 0
        else
            log_error "Error al aplicar migraciones"
            return 1
        fi
    fi
}

# Generar cliente Prisma
generate_prisma_client() {
    log_info "Generando cliente Prisma..."
    
    if $PRISMA_CMD generate 2>&1; then
        log_success "Cliente Prisma generado correctamente"
        return 0
    else
        log_error "Error al generar cliente Prisma"
        return 1
    fi
}

# Verificar si la base de datos está vacía
is_database_empty() {
    log_info "Verificando si la base de datos necesita seed..."
    
    # Contar usuarios en la base de datos
    local user_count
    user_count=$(echo "SELECT COUNT(*) FROM users;" | $PRISMA_CMD db execute --stdin 2>/dev/null | tail -n 1 | tr -d ' ')
    
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
    config_exists=$(echo "SELECT COUNT(*) FROM master_admin_config WHERE id = 'singleton';" | $PRISMA_CMD db execute --stdin 2>/dev/null | tail -n 1 | tr -d ' ')
    
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
    if echo "INSERT INTO master_admin_config (id, password_hash, created_at, updated_at, last_password_change) VALUES ('singleton', '$master_hash', NOW(), NOW(), NOW()) ON CONFLICT (id) DO NOTHING;" | $PRISMA_CMD db execute --stdin 2>&1; then
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
    
    # 1. Detectar comando Prisma
    PRISMA_CMD=$(detect_prisma_cmd)
    log_info "Comando Prisma: $PRISMA_CMD"
    echo ""
    
    # 2. Verificar conexión a la base de datos
    if ! check_database_connection; then
        log_error "No se pudo establecer conexión con la base de datos"
        log_warning "Continuando con el inicio de la aplicación..."
    else
        echo ""
        
        # 3. Ejecutar migraciones
        if run_migrations; then
            echo ""
            
            # 4. Generar cliente Prisma
            if generate_prisma_client; then
                echo ""
                
                # 5. Verificar si necesita seed (solo si la BD está vacía)
                if is_database_empty; then
                    echo ""
                    run_seed
                    echo ""
                fi
                
                # 6. Configurar master password (idempotente)
                configure_master_password
                echo ""
            else
                log_warning "Error al generar cliente Prisma - continuando..."
            fi
        else
            log_warning "Error en migraciones - continuando con inicio de aplicación..."
        fi
    fi
    
    # 7. Verificar archivos de Next.js
    echo ""
    if ! verify_nextjs_files; then
        log_error "Archivos de Next.js no encontrados - no se puede iniciar"
        exit 1
    fi
    
    # 8. Iniciar aplicación Next.js
    echo ""
    log_success "Inicialización completada - iniciando aplicación..."
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
