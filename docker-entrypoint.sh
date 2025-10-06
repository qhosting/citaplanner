
#!/bin/bash
set -euo pipefail

echo "════════════════════════════════════════════════════════════════"
echo "🚀 CITAPLANNER - Sistema de Inicialización Automática"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Configurar PATH para incluir node_modules/.bin
export PATH="$PATH:/app/node_modules/.bin"

# Función para logging con timestamp (escribiendo a stderr para evitar interferencia con tee)
log_info() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ℹ️  $1" >&2
}

log_success() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ✅ $1" >&2
}

log_warning() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️  $1" >&2
}

log_error() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $1" >&2
}

log_debug() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] 🔍 $1" >&2
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

# Verificar conexión a la base de datos usando psql con diagnósticos avanzados
check_database_connection_psql() {
    log_info "Verificando conectividad con PostgreSQL usando psql..."
    
    # Extraer componentes de DATABASE_URL
    local db_user=$(echo "$DATABASE_URL" | sed -E 's|^postgres(ql)?://([^:]+):.*|\2|')
    local db_pass=$(echo "$DATABASE_URL" | sed -E 's|^postgres(ql)?://[^:]+:([^@]+)@.*|\2|')
    local db_host=$(echo "$DATABASE_URL" | sed -E 's|^postgres(ql)?://[^@]+@([^:/]+).*|\2|')
    local db_port=$(echo "$DATABASE_URL" | sed -E 's|^postgres(ql)?://[^@]+@[^:]+:([0-9]+).*|\2|')
    local db_name=$(echo "$DATABASE_URL" | sed -E 's|^postgres(ql)?://[^/]+/([^?]+).*|\2|')
    
    log_info "════════════════════════════════════════════════════════════════"
    log_info "🔍 DIAGNÓSTICO DE CONECTIVIDAD DE RED"
    log_info "════════════════════════════════════════════════════════════════"
    
    # 1. Verificar resolución DNS del hostname
    log_info "1️⃣  Verificando resolución DNS para: $db_host"
    if command -v nslookup >/dev/null 2>&1; then
        local dns_result=$(nslookup "$db_host" 2>&1)
        if echo "$dns_result" | grep -q "Address:"; then
            local resolved_ip=$(echo "$dns_result" | grep "Address:" | tail -1 | awk '{print $2}')
            log_success "✅ DNS resuelto: $db_host -> $resolved_ip"
        else
            log_error "❌ No se pudo resolver DNS para: $db_host"
            log_debug "Salida de nslookup: $dns_result"
        fi
    else
        log_warning "⚠️  nslookup no disponible, instalando bind-tools..."
        apk add --no-cache bind-tools >/dev/null 2>&1 || log_warning "No se pudo instalar bind-tools"
    fi
    
    # 2. Verificar conectividad de red con ping
    log_info "2️⃣  Verificando conectividad de red (ping) a: $db_host"
    if ping -c 2 -W 2 "$db_host" >/dev/null 2>&1; then
        log_success "✅ Ping exitoso a $db_host"
    else
        log_warning "⚠️  Ping falló (puede ser normal si ICMP está bloqueado)"
    fi
    
    # 3. Verificar conectividad TCP al puerto PostgreSQL
    log_info "3️⃣  Verificando conectividad TCP al puerto $db_port en $db_host"
    if command -v nc >/dev/null 2>&1; then
        if nc -zv -w 5 "$db_host" "$db_port" 2>&1 | grep -q "open\|succeeded"; then
            log_success "✅ Puerto $db_port está abierto y accesible en $db_host"
        else
            log_error "❌ No se puede conectar al puerto $db_port en $db_host"
            log_error "   Esto indica un problema de red o que PostgreSQL no está escuchando"
        fi
    else
        log_warning "⚠️  netcat (nc) no disponible, instalando..."
        apk add --no-cache netcat-openbsd >/dev/null 2>&1 || log_warning "No se pudo instalar netcat"
    fi
    
    # 4. Intentar variantes del hostname (sin prefijo)
    log_info "4️⃣  Probando variantes del hostname..."
    local hostname_variants=("$db_host")
    
    # Si el hostname tiene un prefijo (ej: cloudmx_citaplanner-db), probar sin él
    if echo "$db_host" | grep -q "_"; then
        local short_hostname=$(echo "$db_host" | sed 's/^[^_]*_//')
        hostname_variants+=("$short_hostname")
        log_debug "   Variante sin prefijo: $short_hostname"
    fi
    
    # Probar también solo el nombre del servicio
    if echo "$db_host" | grep -q "-"; then
        local service_name=$(echo "$db_host" | sed 's/.*_//')
        hostname_variants+=("$service_name")
        log_debug "   Variante solo servicio: $service_name"
    fi
    
    log_info "════════════════════════════════════════════════════════════════"
    log_info "🔌 INTENTANDO CONEXIÓN A POSTGRESQL"
    log_info "════════════════════════════════════════════════════════════════"
    
    local max_attempts=30
    local attempt=1
    local connection_successful=false
    
    while [ $attempt -le $max_attempts ]; do
        log_debug "Intento $attempt/$max_attempts - Probando conexión a PostgreSQL..."
        
        # Probar cada variante del hostname
        for hostname in "${hostname_variants[@]}"; do
            log_debug "   Probando hostname: $hostname"
            
            # Intentar conexión con psql
            if PGPASSWORD="$db_pass" psql -h "$hostname" -p "$db_port" -U "$db_user" -d "$db_name" -c "SELECT 1;" > /dev/null 2>&1; then
                log_success "✅ Conexión exitosa usando hostname: $hostname"
                
                # Si el hostname exitoso es diferente al original, actualizar DATABASE_URL
                if [ "$hostname" != "$db_host" ]; then
                    log_warning "⚠️  El hostname original '$db_host' no funcionó"
                    log_success "✅ Usando hostname alternativo: $hostname"
                    
                    # Actualizar DATABASE_URL con el hostname correcto
                    export DATABASE_URL=$(echo "$DATABASE_URL" | sed "s|@$db_host:|@$hostname:|")
                    log_info "📝 DATABASE_URL actualizada para usar: $hostname"
                fi
                
                connection_successful=true
                break 2
            fi
        done
        
        if [ $attempt -lt $max_attempts ]; then
            log_warning "Esperando a que PostgreSQL esté disponible... ($attempt/$max_attempts)"
            sleep 2
        fi
        
        attempt=$((attempt + 1))
    done
    
    if [ "$connection_successful" = true ]; then
        log_info "════════════════════════════════════════════════════════════════"
        log_success "✅ CONEXIÓN A POSTGRESQL ESTABLECIDA"
        log_info "════════════════════════════════════════════════════════════════"
        return 0
    else
        log_info "════════════════════════════════════════════════════════════════"
        log_error "❌ NO SE PUDO CONECTAR A POSTGRESQL"
        log_info "════════════════════════════════════════════════════════════════"
        log_error "Diagnóstico completo:"
        log_error "  1. Hostname original: $db_host"
        log_error "  2. Puerto: $db_port"
        log_error "  3. Usuario: $db_user"
        log_error "  4. Base de datos: $db_name"
        log_error ""
        log_error "Posibles causas:"
        log_error "  ❌ El hostname '$db_host' no es correcto para Easypanel"
        log_error "  ❌ PostgreSQL no está ejecutándose o no está listo"
        log_error "  ❌ Las credenciales son incorrectas"
        log_error "  ❌ Problema de red entre contenedores"
        log_error ""
        log_error "Soluciones sugeridas:"
        log_error "  1. Verifica el nombre del servicio PostgreSQL en Easypanel"
        log_error "  2. El hostname debe coincidir con el nombre del servicio"
        log_error "  3. En Easypanel, los servicios se comunican usando sus nombres"
        log_error "  4. Ejemplo: si el servicio se llama 'citaplanner-db', usa ese nombre"
        log_error "  5. NO uses prefijos como 'cloudmx_' en el hostname"
        return 1
    fi
}

# Verificar conexión a la base de datos usando Prisma
check_database_connection() {
    log_info "Verificando conexión con Prisma..."
    
    if [ -z "${DATABASE_URL:-}" ]; then
        log_error "DATABASE_URL no está configurada"
        return 1
    fi
    
    # Intentar conectar con Prisma (solo 1 intento ya que psql ya validó la conexión)
    log_debug "Verificando con Prisma..."
    
    if eval "$PRISMA_CMD db execute --stdin" <<EOF > /dev/null 2>&1
SELECT 1;
EOF
    then
        log_success "Prisma puede conectarse a la base de datos"
        return 0
    fi
    
    log_warning "Prisma no pudo verificar la conexión, pero continuaremos (psql ya validó conectividad)"
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
    
    # Verificar que el script de seed existe (en app/scripts/seed.ts)
    if [ ! -f "app/scripts/seed.ts" ]; then
        log_error "Script de seed no encontrado en app/scripts/seed.ts"
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
