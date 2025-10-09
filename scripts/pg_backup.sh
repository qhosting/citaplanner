
#!/bin/bash

###############################################################################
# Script de Backup Automático para PostgreSQL - CitaPlanner
###############################################################################
#
# Este script realiza backups automáticos de la base de datos PostgreSQL
# con las siguientes características:
#
# - Backups completos con pg_dump
# - Compresión automática con gzip
# - Rotación de backups (mantiene últimos 7 días, 4 semanas, 6 meses)
# - Verificación de integridad del backup
# - Logs detallados de cada operación
# - Notificaciones de errores
#
# Uso:
#   ./pg_backup.sh                    # Backup manual
#   ./pg_backup.sh --verify-only      # Solo verificar backups existentes
#   ./pg_backup.sh --restore ARCHIVO  # Restaurar desde backup
#
###############################################################################

set -euo pipefail

# ============================================
# CONFIGURACIÓN
# ============================================

# Directorio de backups (debe coincidir con el volumen montado en Easypanel)
BACKUP_DIR="${BACKUP_DIR:-/backup-citaplanner}"
LOG_DIR="${LOG_DIR:-$BACKUP_DIR/logs}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATE_ONLY=$(date +%Y%m%d)

# Configuración de retención
DAILY_RETENTION=7      # Mantener backups diarios de los últimos 7 días
WEEKLY_RETENTION=4     # Mantener backups semanales de las últimas 4 semanas
MONTHLY_RETENTION=6    # Mantener backups mensuales de los últimos 6 meses

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================
# FUNCIONES DE LOGGING
# ============================================

log_info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} ℹ️  $1" | tee -a "$LOG_DIR/backup_${DATE_ONLY}.log"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} ✅ $1" | tee -a "$LOG_DIR/backup_${DATE_ONLY}.log"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} ⚠️  $1" | tee -a "$LOG_DIR/backup_${DATE_ONLY}.log"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} ❌ $1" | tee -a "$LOG_DIR/backup_${DATE_ONLY}.log"
}

# ============================================
# FUNCIONES DE UTILIDAD
# ============================================

# Crear directorios necesarios
setup_directories() {
    mkdir -p "$BACKUP_DIR"/{daily,weekly,monthly}
    mkdir -p "$LOG_DIR"
    log_success "Directorios de backup configurados"
}

# Extraer información de DATABASE_URL
parse_database_url() {
    if [ -z "${DATABASE_URL:-}" ]; then
        log_error "DATABASE_URL no está configurada"
        exit 1
    fi

    export PGHOST=$(echo "$DATABASE_URL" | sed -E 's|^postgres(ql)?://[^@]+@([^:/]+).*|\2|')
    export PGPORT=$(echo "$DATABASE_URL" | sed -E 's|^postgres(ql)?://[^@]+@[^:]+:([0-9]+).*|\2|')
    export PGDATABASE=$(echo "$DATABASE_URL" | sed -E 's|^postgres(ql)?://[^/]+/([^?]+).*|\2|')
    export PGUSER=$(echo "$DATABASE_URL" | sed -E 's|^postgres(ql)?://([^:]+):.*|\2|')
    export PGPASSWORD=$(echo "$DATABASE_URL" | sed -E 's|^postgres(ql)?://[^:]+:([^@]+)@.*|\2|')

    log_info "Configuración de base de datos:"
    log_info "  Host: $PGHOST"
    log_info "  Puerto: $PGPORT"
    log_info "  Base de datos: $PGDATABASE"
    log_info "  Usuario: $PGUSER"
}

# Verificar conectividad con PostgreSQL
check_connection() {
    log_info "Verificando conexión a PostgreSQL..."
    
    if pg_isready -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" > /dev/null 2>&1; then
        log_success "Conexión a PostgreSQL establecida"
        return 0
    else
        log_error "No se puede conectar a PostgreSQL"
        return 1
    fi
}

# ============================================
# FUNCIONES DE BACKUP
# ============================================

# Realizar backup completo
perform_backup() {
    local backup_type=$1  # daily, weekly, monthly
    local backup_file="$BACKUP_DIR/$backup_type/citaplanner_${backup_type}_${TIMESTAMP}.sql.gz"
    
    log_info "════════════════════════════════════════════════════════════════"
    log_info "Iniciando backup $backup_type"
    log_info "════════════════════════════════════════════════════════════════"
    
    # Realizar backup con pg_dump
    log_info "Ejecutando pg_dump..."
    
    if pg_dump -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" \
        --format=plain \
        --no-owner \
        --no-acl \
        --verbose \
        2>> "$LOG_DIR/backup_${DATE_ONLY}.log" | gzip > "$backup_file"; then
        
        local backup_size=$(du -h "$backup_file" | cut -f1)
        log_success "Backup completado: $backup_file ($backup_size)"
        
        # Verificar integridad del backup
        if verify_backup "$backup_file"; then
            log_success "Backup verificado correctamente"
            
            # Crear checksum
            sha256sum "$backup_file" > "${backup_file}.sha256"
            log_success "Checksum creado: ${backup_file}.sha256"
            
            return 0
        else
            log_error "Verificación de backup falló"
            rm -f "$backup_file"
            return 1
        fi
    else
        log_error "Error al crear backup"
        return 1
    fi
}

# Verificar integridad del backup
verify_backup() {
    local backup_file=$1
    
    log_info "Verificando integridad del backup..."
    
    # Verificar que el archivo no está vacío
    if [ ! -s "$backup_file" ]; then
        log_error "El archivo de backup está vacío"
        return 1
    fi
    
    # Verificar que es un archivo gzip válido
    if ! gzip -t "$backup_file" 2>/dev/null; then
        log_error "El archivo de backup está corrupto (gzip inválido)"
        return 1
    fi
    
    # Verificar que contiene SQL válido
    if ! gunzip -c "$backup_file" | head -n 20 | grep -q "PostgreSQL database dump"; then
        log_error "El archivo no parece ser un dump de PostgreSQL válido"
        return 1
    fi
    
    return 0
}

# ============================================
# FUNCIONES DE ROTACIÓN
# ============================================

# Rotar backups antiguos
rotate_backups() {
    log_info "════════════════════════════════════════════════════════════════"
    log_info "Rotando backups antiguos"
    log_info "════════════════════════════════════════════════════════════════"
    
    # Rotar backups diarios (mantener últimos 7 días)
    log_info "Rotando backups diarios (mantener últimos $DAILY_RETENTION días)..."
    find "$BACKUP_DIR/daily" -name "*.sql.gz" -type f -mtime +$DAILY_RETENTION -delete
    find "$BACKUP_DIR/daily" -name "*.sha256" -type f -mtime +$DAILY_RETENTION -delete
    
    # Rotar backups semanales (mantener últimas 4 semanas)
    log_info "Rotando backups semanales (mantener últimas $WEEKLY_RETENTION semanas)..."
    find "$BACKUP_DIR/weekly" -name "*.sql.gz" -type f -mtime +$((WEEKLY_RETENTION * 7)) -delete
    find "$BACKUP_DIR/weekly" -name "*.sha256" -type f -mtime +$((WEEKLY_RETENTION * 7)) -delete
    
    # Rotar backups mensuales (mantener últimos 6 meses)
    log_info "Rotando backups mensuales (mantener últimos $MONTHLY_RETENTION meses)..."
    find "$BACKUP_DIR/monthly" -name "*.sql.gz" -type f -mtime +$((MONTHLY_RETENTION * 30)) -delete
    find "$BACKUP_DIR/monthly" -name "*.sha256" -type f -mtime +$((MONTHLY_RETENTION * 30)) -delete
    
    log_success "Rotación de backups completada"
}

# ============================================
# FUNCIONES DE RESTAURACIÓN
# ============================================

# Restaurar desde backup
restore_backup() {
    local backup_file=$1
    
    if [ ! -f "$backup_file" ]; then
        log_error "Archivo de backup no encontrado: $backup_file"
        exit 1
    fi
    
    log_warning "════════════════════════════════════════════════════════════════"
    log_warning "⚠️  ADVERTENCIA: RESTAURACIÓN DE BASE DE DATOS"
    log_warning "════════════════════════════════════════════════════════════════"
    log_warning "Esta operación SOBRESCRIBIRÁ todos los datos actuales"
    log_warning "Archivo: $backup_file"
    log_warning ""
    read -p "¿Estás seguro de continuar? (escribe 'SI' para confirmar): " confirm
    
    if [ "$confirm" != "SI" ]; then
        log_info "Restauración cancelada"
        exit 0
    fi
    
    log_info "Verificando backup antes de restaurar..."
    if ! verify_backup "$backup_file"; then
        log_error "El backup no pasó la verificación de integridad"
        exit 1
    fi
    
    # Verificar checksum si existe
    if [ -f "${backup_file}.sha256" ]; then
        log_info "Verificando checksum..."
        if sha256sum -c "${backup_file}.sha256" > /dev/null 2>&1; then
            log_success "Checksum verificado correctamente"
        else
            log_error "Checksum no coincide - el archivo puede estar corrupto"
            exit 1
        fi
    fi
    
    log_info "Iniciando restauración..."
    
    # Desconectar usuarios activos
    log_info "Desconectando usuarios activos..."
    psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d postgres -c \
        "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$PGDATABASE' AND pid <> pg_backend_pid();" \
        2>> "$LOG_DIR/restore_${DATE_ONLY}.log"
    
    # Eliminar base de datos existente
    log_warning "Eliminando base de datos existente..."
    dropdb -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" "$PGDATABASE" --if-exists \
        2>> "$LOG_DIR/restore_${DATE_ONLY}.log"
    
    # Crear nueva base de datos
    log_info "Creando nueva base de datos..."
    createdb -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" "$PGDATABASE" \
        2>> "$LOG_DIR/restore_${DATE_ONLY}.log"
    
    # Restaurar desde backup
    log_info "Restaurando datos desde backup..."
    if gunzip -c "$backup_file" | psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" \
        2>> "$LOG_DIR/restore_${DATE_ONLY}.log"; then
        log_success "════════════════════════════════════════════════════════════════"
        log_success "✅ RESTAURACIÓN COMPLETADA EXITOSAMENTE"
        log_success "════════════════════════════════════════════════════════════════"
        return 0
    else
        log_error "Error durante la restauración"
        log_error "Revisa el log: $LOG_DIR/restore_${DATE_ONLY}.log"
        return 1
    fi
}

# ============================================
# FUNCIÓN PRINCIPAL
# ============================================

main() {
    log_info "════════════════════════════════════════════════════════════════"
    log_info "🔄 CitaPlanner - Sistema de Backup PostgreSQL"
    log_info "════════════════════════════════════════════════════════════════"
    log_info "Timestamp: $TIMESTAMP"
    log_info ""
    
    # Configurar directorios
    setup_directories
    
    # Parsear DATABASE_URL
    parse_database_url
    
    # Verificar conexión
    if ! check_connection; then
        log_error "No se puede continuar sin conexión a la base de datos"
        exit 1
    fi
    
    # Procesar argumentos
    case "${1:-}" in
        --verify-only)
            log_info "Modo: Solo verificación"
            # Verificar todos los backups existentes
            for backup_file in "$BACKUP_DIR"/{daily,weekly,monthly}/*.sql.gz; do
                if [ -f "$backup_file" ]; then
                    log_info "Verificando: $backup_file"
                    verify_backup "$backup_file"
                fi
            done
            ;;
            
        --restore)
            if [ -z "${2:-}" ]; then
                log_error "Debes especificar el archivo de backup a restaurar"
                log_error "Uso: $0 --restore /ruta/al/backup.sql.gz"
                exit 1
            fi
            restore_backup "$2"
            ;;
            
        *)
            # Backup normal
            log_info "Modo: Backup automático"
            
            # Determinar tipo de backup según el día
            day_of_week=$(date +%u)  # 1=Lunes, 7=Domingo
            day_of_month=$(date +%d)
            
            # Backup diario (siempre)
            perform_backup "daily"
            
            # Backup semanal (domingos)
            if [ "$day_of_week" -eq 7 ]; then
                log_info "Es domingo - creando backup semanal"
                perform_backup "weekly"
            fi
            
            # Backup mensual (primer día del mes)
            if [ "$day_of_month" -eq 01 ]; then
                log_info "Es primer día del mes - creando backup mensual"
                perform_backup "monthly"
            fi
            
            # Rotar backups antiguos
            rotate_backups
            
            # Resumen final
            log_info ""
            log_info "════════════════════════════════════════════════════════════════"
            log_info "📊 Resumen de backups"
            log_info "════════════════════════════════════════════════════════════════"
            log_info "Backups diarios: $(find "$BACKUP_DIR/daily" -name "*.sql.gz" | wc -l)"
            log_info "Backups semanales: $(find "$BACKUP_DIR/weekly" -name "*.sql.gz" | wc -l)"
            log_info "Backups mensuales: $(find "$BACKUP_DIR/monthly" -name "*.sql.gz" | wc -l)"
            log_info "Espacio usado: $(du -sh "$BACKUP_DIR" | cut -f1)"
            log_success "Proceso de backup completado exitosamente"
            ;;
    esac
}

# Ejecutar función principal
main "$@"
