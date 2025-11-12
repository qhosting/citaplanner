# 🚀 Guía Rápida: Fix Migraciones Prisma en Easypanel

## ⏱️ Tiempo Estimado: 10-15 minutos

---

## 📋 Pre-requisitos

Antes de comenzar, asegúrate de tener:

- ✅ Acceso a Easypanel (https://citaplanner.com o tu dominio)
- ✅ Credenciales de administrador
- ✅ Backup automático configurado (verificar en Easypanel)

---

## 🎯 Proceso Paso a Paso

### **Paso 1: Crear Backup de Seguridad** (⏱️ 2 min)

#### 1.1 Acceder a Easypanel
```
URL: https://citaplanner.com/panel (o tu URL de Easypanel)
```

#### 1.2 Navegar a Base de Datos
```
Easypanel Dashboard > Projects > CitaPlanner > Services > citaplanner-db
```

#### 1.3 Verificar/Crear Backup
```
citaplanner-db > Backups > "Crear copia de seguridad de volumen"

Configuración:
- Volumen: citaplanner-postgres-data
- Destino: Local Disk: /backup-citaplanner
- Ejecutar ahora: Manual
```

✅ **Checkpoint**: Verifica que el backup se haya creado exitosamente

---

### **Paso 2: Acceder al Terminal de la Aplicación** (⏱️ 1 min)

#### 2.1 Abrir Terminal
```
Easypanel Dashboard > Projects > CitaPlanner > Services > citaplanner > Terminal
```

Deberías ver algo como:
```
/app #
```

---

### **Paso 3: Verificar Estado Actual** (⏱️ 2 min)

#### 3.1 Verificar Conexión a Base de Datos
```bash
cd /app
echo $DATABASE_URL
```

**Salida esperada**: URL de PostgreSQL (debería ser visible)

#### 3.2 Ver Estado de Migraciones
```bash
npx prisma migrate status
```

**Salida esperada**: 
```
The database schema is not empty. Read more about how to baseline...
```

---

### **Paso 4: Aplicar Solución Automatizada** (⏱️ 5 min)

#### 4.1 Verificar Script
```bash
ls -la fix-migrations.sh
```

Si no existe el script, créalo:
```bash
cat > fix-migrations.sh << 'EOF'
[COPIAR CONTENIDO DEL SCRIPT]
EOF

chmod +x fix-migrations.sh
```

#### 4.2 Ejecutar Script
```bash
./fix-migrations.sh
```

#### 4.3 Confirmar Ejecución
Cuando el script pregunte:
```
¿Has verificado lo anterior y deseas continuar? (escribe 'yes' para confirmar):
```

Escribe: `yes` y presiona Enter

**Salida esperada**:
```
✅ Migraciones exitosas: 10
⚠️  Migraciones omitidas: 0
✅ Cliente Prisma regenerado exitosamente
🎉 Proceso completado exitosamente!
```

---

### **Paso 5: Aplicación Manual (Alternativa)** (⏱️ 8 min)

Si prefieres ejecutar los comandos manualmente:

```bash
# Marcar cada migración como aplicada
npx prisma migrate resolve --applied "20241005_add_master_admin_config"
npx prisma migrate resolve --applied "20251007193712_icalendar_integration"
npx prisma migrate resolve --applied "20251007200241_phase1_system_configuration"
npx prisma migrate resolve --applied "20251007204923_phase2_client_module"
npx prisma migrate resolve --applied "20251007204938_phase2_client_module"
npx prisma migrate resolve --applied "20251008005257_phase3_sales_module"
npx prisma migrate resolve --applied "20251008190206_gender_enum_spanish"
npx prisma migrate resolve --applied "20251009072859_notifications_system"
npx prisma migrate resolve --applied "20251014_add_branch_assignments"
npx prisma migrate resolve --applied "20251015_whatsapp_integration"

# Regenerar cliente Prisma
npx prisma generate
```

---

### **Paso 6: Verificar Solución** (⏱️ 2 min)

#### 6.1 Verificar Estado Final
```bash
npx prisma migrate status
```

**Salida esperada**:
```
Database schema is up to date!

10 migrations found in prisma/migrations
All migrations have been applied.
```

#### 6.2 Validar Esquema
```bash
npx prisma validate
```

**Salida esperada**:
```
✅ The schema at prisma/schema.prisma is valid
```

---

### **Paso 7: Reiniciar Aplicación** (⏱️ 2 min)

#### 7.1 Salir del Terminal
```bash
exit
```

#### 7.2 Reiniciar Servicio
```
Easypanel > CitaPlanner > Services > citaplanner > Restart
```

Esperar ~30 segundos a que el servicio se reinicie.

#### 7.3 Verificar Logs
```
Easypanel > CitaPlanner > Services > citaplanner > Logs
```

**Buscar**:
- ✅ `Server running on port 3000`
- ✅ Sin errores de Prisma
- ❌ NO debería haber: `P3005` o `migration` errors

---

### **Paso 8: Pruebas Funcionales** (⏱️ 3 min)

#### 8.1 Acceder a la Aplicación
```
URL: https://citaplanner.com (o tu dominio)
```

#### 8.2 Probar Login
```
Ingresar con usuario de prueba o master admin
```

#### 8.3 Probar Funcionalidades Críticas
- [ ] **Dashboard**: Debería cargar sin errores
- [ ] **Citas**: Crear nueva cita
- [ ] **Clientes**: Ver lista de clientes
- [ ] **Servicios**: Ver lista de servicios
- [ ] **Ventas/POS**: Acceder al módulo
- [ ] **Notificaciones**: Verificar que se muestren
- [ ] **WhatsApp**: Verificar configuración

---

## ✅ Checklist Final

Marca cada item al completarlo:

### Pre-Ejecución
- [ ] Backup de base de datos creado
- [ ] Acceso a terminal de Easypanel confirmado
- [ ] Variable DATABASE_URL verificada

### Ejecución
- [ ] Script ejecutado exitosamente
- [ ] Las 10 migraciones marcadas como aplicadas
- [ ] Cliente Prisma regenerado
- [ ] `prisma migrate status` sin errores

### Post-Ejecución
- [ ] Servicio reiniciado
- [ ] Logs sin errores de Prisma
- [ ] Login funcional
- [ ] Módulos principales funcionando

---

## 🚨 Troubleshooting

### Error: "Cannot connect to database"

**Causa**: DATABASE_URL incorrecta o servicio DB caído

**Solución**:
```bash
# Verificar DATABASE_URL
echo $DATABASE_URL

# Verificar servicio de DB
# En Easypanel: Services > citaplanner-db > Estado
```

---

### Error: "Migration already recorded as applied"

**Causa**: La migración ya está aplicada

**Solución**: Omitir y continuar con la siguiente

---

### Error: "Schema drift detected"

**Causa**: Esquema en DB difiere de schema.prisma

**Solución**:
```bash
npx prisma db pull
npx prisma generate
```

---

### Error: Script no encontrado

**Causa**: Script no está en el directorio

**Solución**:
```bash
# Verificar ubicación
pwd
ls -la fix-migrations.sh

# Si no existe, usar comandos manuales del Paso 5
```

---

## 📞 Comandos Útiles de Diagnóstico

```bash
# Ver estado de migraciones
npx prisma migrate status

# Verificar conexión a DB
npx prisma db pull --print

# Validar esquema
npx prisma validate

# Regenerar cliente
npx prisma generate

# Ver versión de Prisma
npx prisma --version

# Ver variables de entorno (sin mostrar secretos)
env | grep DATABASE
```

---

## 🔄 Rollback (En caso de problemas)

Si algo sale mal:

### 1. Restaurar Backup
```
Easypanel > citaplanner-db > Backups > Seleccionar backup > Restaurar
```

### 2. Reiniciar Servicios
```
Easypanel > Restart citaplanner
Easypanel > Restart citaplanner-db
```

### 3. Verificar Estado
```bash
npx prisma migrate status
```

---

## 📊 Tiempos de Ejecución Esperados

| Paso | Descripción | Tiempo |
|------|-------------|--------|
| 1 | Crear backup | 2 min |
| 2 | Acceder terminal | 1 min |
| 3 | Verificar estado | 2 min |
| 4 | Ejecutar script | 5 min |
| 5 | Verificar solución | 2 min |
| 6 | Reiniciar app | 2 min |
| 7 | Pruebas funcionales | 3 min |
| **TOTAL** | | **15-17 min** |

---

## 🎯 Criterios de Éxito

La solución es exitosa cuando:

1. ✅ `npx prisma migrate status` retorna: "Database schema is up to date!"
2. ✅ Logs de la aplicación sin errores de Prisma
3. ✅ Login funcional
4. ✅ Todas las funcionalidades principales operativas
5. ✅ No hay errores en consola del navegador

---

## 📝 Comandos de Copia Rápida

### Verificación Rápida
```bash
cd /app && npx prisma migrate status
```

### Fix Rápido (Script)
```bash
cd /app && chmod +x fix-migrations.sh && ./fix-migrations.sh
```

### Fix Rápido (Manual - Una línea)
```bash
for m in "20241005_add_master_admin_config" "20251007193712_icalendar_integration" "20251007200241_phase1_system_configuration" "20251007204923_phase2_client_module" "20251007204938_phase2_client_module" "20251008005257_phase3_sales_module" "20251008190206_gender_enum_spanish" "20251009072859_notifications_system" "20251014_add_branch_assignments" "20251015_whatsapp_integration"; do npx prisma migrate resolve --applied "$m"; done && npx prisma generate
```

---

## 📚 Documentación Adicional

- **Documento completo**: `SOLUCION_MIGRACIONES_PRISMA.md`
- **Script automatizado**: `fix-migrations.sh`
- **Referencias Prisma**: [prisma.io/docs/guides/database/production-troubleshooting](https://www.prisma.io/docs/guides/database/production-troubleshooting)

---

## ✨ Resumen Ejecutivo de 3 Pasos

### Para usuarios con prisa:

```bash
# 1. Acceder al terminal de Easypanel
# Easypanel > CitaPlanner > citaplanner > Terminal

# 2. Ejecutar fix
cd /app && ./fix-migrations.sh

# 3. Reiniciar servicio
# Easypanel > CitaPlanner > citaplanner > Restart
```

✅ **Listo!** La aplicación debería funcionar correctamente.

---

**Versión**: 1.0  
**Fecha**: 15 de Octubre, 2025  
**Tiempo de ejecución**: 10-15 minutos  
**Dificultad**: Baja  
**Riesgo**: Bajo (con backup)
