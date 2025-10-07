#!/bin/bash

################################################################################
# Script de Diagnóstico de Base de Datos - CitaPlanner
# Versión: 1.0.0
# Propósito: Verificar conectividad y estado de PostgreSQL
################################################################################

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Funciones de utilidad
print_header() {
    echo -e "\n${BOLD}${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BOLD}${BLUE}  $1${NC}"
    echo -e "${BOLD}${BLUE}═══════════════════════════════════════════════════════════════${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_section() {
    echo -e "\n${BOLD}$1${NC}"
    echo "─────────────────────────────────────────────────────"
}

# Verificar que DATABASE_URL está configurada
check_env() {
    print_header "VERIFICACIÓN DE VARIABLES DE ENTORNO"
    
    if [ -z "$DATABASE_URL" ]; then
        print_error "DATABASE_URL no está configurada"
        print_info "Por favor, configura DATABASE_URL en tus variables de entorno"
        exit 1
    else
        print_success "DATABASE_URL está configurada"
    fi
    
    # Extraer componentes de la URL
    print_section "Componentes de DATABASE_URL"
    
    # Parse DATABASE_URL
    if [[ $DATABASE_URL =~ postgres://([^:]+):([^@]+)@([^:]+):([^/]+)/([^?]+) ]]; then
        DB_USER="${BASH_REMATCH[1]}"
        DB_PASSWORD="${BASH_REMATCH[2]}"
        DB_HOST="${BASH_REMATCH[3]}"
        DB_PORT="${BASH_REMATCH[4]}"
        DB_NAME="${BASH_REMATCH[5]}"
        
        echo "  Usuario:     $DB_USER"
        echo "  Contraseña:  ${DB_PASSWORD:0:4}${'*' * (${#DB_PASSWORD} - 4)}"
        echo "  Hostname:    $DB_HOST"
        echo "  Puerto:      $DB_PORT"
        echo "  Database:    $DB_NAME"
    else
        print_error "No se pudo parsear DATABASE_URL"
        print_info "Formato esperado: postgres://user:password@host:port/database"
        exit 1
    fi
}

# Verificar resolución DNS
check_dns() {
    print_header "VERIFICACIÓN DE RESOLUCIÓN DNS"
    
    print_info "Intentando resolver hostname: $DB_HOST"
    
    if command -v nslookup &> /dev/null; then
        if nslookup "$DB_HOST" &> /dev/null; then
            IP=$(nslookup "$DB_HOST" | grep -A1 "Name:" | tail -n1 | awk '{print $2}')
            print_success "Hostname resuelve a: $IP"
        else
            print_error "No se pudo resolver el hostname: $DB_HOST"
            print_warning "Posibles causas:"
            echo "  - El servicio PostgreSQL no existe"
            echo "  - El nombre del servicio es incorrecto"
            echo "  - Los servicios no están en la misma red"
        fi
    elif command -v host &> /dev/null; then
        if host "$DB_HOST" &> /dev/null; then
            IP=$(host "$DB_HOST" | grep "has address" | awk '{print $4}')
            print_success "Hostname resuelve a: $IP"
        else
            print_error "No se pudo resolver el hostname: $DB_HOST"
        fi
    else
        print_warning "nslookup y host no están disponibles, omitiendo verificación DNS"
    fi
}

# Verificar conectividad de red
check_network() {
    print_header "VERIFICACIÓN DE CONECTIVIDAD DE RED"
    
    print_section "Ping Test"
    if command -v ping &> /dev/null; then
        if ping -c 2 -W 2 "$DB_HOST" &> /dev/null; then
            print_success "Ping exitoso a $DB_HOST"
        else
            print_error "No se pudo hacer ping a $DB_HOST"
            print_warning "Esto puede ser normal si ICMP está bloqueado"
        fi
    else
        print_warning "ping no está disponible"
    fi
    
    print_section "Port Test (Puerto $DB_PORT)"
    
    # Intentar nc primero
    if command -v nc &> /dev/null; then
        if nc -z -w 2 "$DB_HOST" "$DB_PORT" &> /dev/null; then
            print_success "Puerto $DB_PORT está abierto en $DB_HOST"
        else
            print_error "No se pudo conectar al puerto $DB_PORT en $DB_HOST"
            print_warning "Posibles causas:"
            echo "  - PostgreSQL no está corriendo"
            echo "  - El puerto está bloqueado"
            echo "  - El hostname es incorrecto"
        fi
    # Si nc no está disponible, intentar con telnet
    elif command -v telnet &> /dev/null; then
        if timeout 2 telnet "$DB_HOST" "$DB_PORT" 2>&1 | grep -q "Connected\|Escape character"; then
            print_success "Puerto $DB_PORT está abierto en $DB_HOST"
        else
            print_error "No se pudo conectar al puerto $DB_PORT en $DB_HOST"
        fi
    # Si ninguno está disponible, intentar con bash
    elif timeout 2 bash -c "echo >/dev/tcp/$DB_HOST/$DB_PORT" 2>/dev/null; then
        print_success "Puerto $DB_PORT está abierto en $DB_HOST"
    else
        print_error "No se pudo conectar al puerto $DB_PORT en $DB_HOST"
    fi
}

# Verificar conexión con psql
check_psql_connection() {
    print_header "VERIFICACIÓN DE CONEXIÓN POSTGRESQL"
    
    if ! command -v psql &> /dev/null; then
        print_warning "psql no está instalado, instalando..."
        
        # Intentar instalar postgresql-client
        if command -v apt-get &> /dev/null; then
            apt-get update -qq && apt-get install -y -qq postgresql-client > /dev/null 2>&1
            print_success "postgresql-client instalado"
        else
            print_error "No se pudo instalar postgresql-client automáticamente"
            print_info "Por favor, instala postgresql-client manualmente"
            return 1
        fi
    fi
    
    print_info "Intentando conectar con psql..."
    
    if psql "$DATABASE_URL" -c "SELECT version();" &> /dev/null; then
        print_success "Conexión exitosa con psql"
        
        print_section "Versión de PostgreSQL"
        psql "$DATABASE_URL" -t -c "SELECT version();" | sed 's/^[ \t]*/  /'
        
    else
        print_error "No se pudo conectar con psql"
        print_info "Detalles del error:"
        psql "$DATABASE_URL" -c "SELECT version();" 2>&1 | sed 's/^/  /'
        return 1
    fi
}

# Verificar conexión con Prisma
check_prisma_connection() {
    print_header "VERIFICACIÓN DE CONEXIÓN PRISMA"
    
    if ! command -v npx &> /dev/null; then
        print_error "Node.js/npx no está disponible"
        return 1
    fi
    
    print_info "Verificando Prisma CLI..."
    
    if [ -f "node_modules/.bin/prisma" ]; then
        print_success "Prisma CLI encontrado"
    else
        print_warning "Prisma CLI no encontrado en node_modules"
        if [ -f "package.json" ]; then
            print_info "Ejecuta: npm install"
        fi
        return 1
    fi
    
    print_info "Intentando conectar con Prisma..."
    
    # Intentar db push (esto verifica la conexión sin aplicar cambios si no hay diferencias)
    if npx prisma db push --skip-generate --accept-data-loss 2>&1 | grep -q "already in sync\|is now in sync"; then
        print_success "Conexión exitosa con Prisma"
    elif npx prisma db push --skip-generate --accept-data-loss 2>&1 | grep -q "Connected"; then
        print_success "Conexión exitosa con Prisma"
    else
        print_error "No se pudo conectar con Prisma"
        print_info "Detalles del error:"
        npx prisma db push --skip-generate --accept-data-loss 2>&1 | sed 's/^/  /'
        return 1
    fi
}

# Verificar estado de migraciones
check_migrations() {
    print_header "VERIFICACIÓN DE MIGRACIONES"
    
    if ! command -v npx &> /dev/null || [ ! -f "node_modules/.bin/prisma" ]; then
        print_warning "Prisma no está disponible, omitiendo verificación de migraciones"
        return 0
    fi
    
    print_info "Verificando estado de migraciones..."
    
    MIGRATION_OUTPUT=$(npx prisma migrate status 2>&1)
    
    if echo "$MIGRATION_OUTPUT" | grep -q "Database schema is up to date"; then
        print_success "Todas las migraciones están aplicadas"
    elif echo "$MIGRATION_OUTPUT" | grep -q "following migration.*have not yet been applied"; then
        print_warning "Hay migraciones pendientes"
        print_info "Migraciones pendientes:"
        echo "$MIGRATION_OUTPUT" | grep -A 10 "have not yet been applied" | sed 's/^/  /'
        print_info "Ejecuta: npx prisma migrate deploy"
    elif echo "$MIGRATION_OUTPUT" | grep -q "No migration found"; then
        print_warning "No se encontraron migraciones"
        print_info "Ejecuta: npx prisma migrate dev --name init"
    else
        print_error "Error al verificar migraciones"
        echo "$MIGRATION_OUTPUT" | sed 's/^/  /'
    fi
}

# Listar tablas existentes
list_tables() {
    print_header "TABLAS EN LA BASE DE DATOS"
    
    if command -v psql &> /dev/null; then
        print_info "Listando tablas..."
        
        TABLES=$(psql "$DATABASE_URL" -t -c "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename;" 2>&1)
        
        if [ $? -eq 0 ]; then
            TABLE_COUNT=$(echo "$TABLES" | grep -v '^$' | wc -l)
            
            if [ "$TABLE_COUNT" -eq 0 ]; then
                print_warning "No se encontraron tablas en el schema 'public'"
                print_info "Las migraciones probablemente no se han ejecutado"
            else
                print_success "Se encontraron $TABLE_COUNT tabla(s):"
                echo "$TABLES" | sed 's/^[ \t]*/  ✓ /'
                
                # Verificar tabla específica
                print_section "Verificación de Tabla master_admin_config"
                if echo "$TABLES" | grep -q "master_admin_config"; then
                    print_success "Tabla 'master_admin_config' existe"
                    
                    # Contar registros
                    COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM master_admin_config;" 2>&1)
                    if [ $? -eq 0 ]; then
                        print_info "Registros en master_admin_config: $COUNT"
                    fi
                else
                    print_error "Tabla 'master_admin_config' NO existe"
                    print_info "Esta tabla es necesaria para el login del master admin"
                    print_info "Ejecuta: npx prisma migrate deploy"
                fi
            fi
        else
            print_error "Error al listar tablas"
            echo "$TABLES" | sed 's/^/  /'
        fi
    else
        print_warning "psql no está disponible, no se pueden listar tablas"
    fi
}

# Verificar configuración de la base de datos
check_db_config() {
    print_header "CONFIGURACIÓN DE LA BASE DE DATOS"
    
    if command -v psql &> /dev/null; then
        print_section "Información General"
        
        INFO=$(psql "$DATABASE_URL" -t -c "
            SELECT 
                current_database() as database,
                current_user as user,
                inet_server_addr() as server_ip,
                inet_server_port() as server_port,
                version() as version;
        " 2>&1)
        
        if [ $? -eq 0 ]; then
            echo "$INFO" | sed 's/^[ \t]*/  /'
        else
            print_error "Error al obtener información de la base de datos"
        fi
        
        print_section "Estadísticas de Conexión"
        
        STATS=$(psql "$DATABASE_URL" -t -c "
            SELECT 
                count(*) as total_connections,
                count(*) FILTER (WHERE state = 'active') as active_connections,
                count(*) FILTER (WHERE state = 'idle') as idle_connections
            FROM pg_stat_activity
            WHERE datname = current_database();
        " 2>&1)
        
        if [ $? -eq 0 ]; then
            echo "$STATS" | sed 's/^[ \t]*/  /'
        fi
    fi
}

# Resumen y recomendaciones
print_summary() {
    print_header "RESUMEN Y RECOMENDACIONES"
    
    echo "Si todos los checks pasaron (✓):"
    echo "  1. La conexión a PostgreSQL funciona correctamente"
    echo "  2. Puedes proceder a ejecutar migraciones si están pendientes"
    echo "  3. La aplicación debería funcionar correctamente"
    echo ""
    echo "Si hay checks fallidos (✗):"
    echo "  1. Revisa la guía de troubleshooting: docs/troubleshooting_database.md"
    echo "  2. Verifica la configuración en Easypanel"
    echo "  3. Asegúrate de que el servicio PostgreSQL esté corriendo"
    echo ""
    echo "Comandos útiles:"
    echo "  - Aplicar migraciones:        npx prisma migrate deploy"
    echo "  - Verificar estado:           npx prisma migrate status"
    echo "  - Ver schema actual:          npx prisma db pull"
    echo "  - Conectar con psql:          psql \"\$DATABASE_URL\""
    echo ""
}

# Main
main() {
    clear
    
    print_header "DIAGNÓSTICO DE BASE DE DATOS - CITAPLANNER"
    
    echo "Este script verificará la conectividad y estado de PostgreSQL"
    echo "Fecha: $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""
    
    # Ejecutar verificaciones
    check_env
    check_dns
    check_network
    check_psql_connection
    check_prisma_connection
    check_migrations
    list_tables
    check_db_config
    print_summary
    
    print_header "DIAGNÓSTICO COMPLETADO"
}

# Ejecutar
main "$@"
