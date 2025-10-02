
# Panel de Administración Master - CitaPlanner

## 📋 Descripción

El Panel de Administración Master es una interfaz especial protegida con master password que permite realizar operaciones administrativas críticas antes de ir a producción. Este panel está diseñado para ser usado únicamente por administradores del sistema con los permisos más altos.

## 🔐 Configuración del Master Password

### 1. Generar el Hash del Master Password

Antes de usar el panel, debe configurar el master password. Para generar el hash:

```bash
cd app
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('TU_PASSWORD_AQUI', 12).then(hash => console.log(hash))"
```

Reemplace `TU_PASSWORD_AQUI` con su contraseña deseada. Este comando generará un hash que debe copiar.

### 2. Configurar Variables de Entorno

Agregue el hash generado a sus variables de entorno:

**Para desarrollo (.env):**
```env
MASTER_PASSWORD_HASH="$2a$12$..."
```

**Para producción (.env.production):**
```env
MASTER_PASSWORD_HASH="$2a$12$..."
```

⚠️ **IMPORTANTE:** 
- Nunca guarde el master password en texto plano
- Nunca haga commit del archivo .env con el hash real
- Use contraseñas fuertes (mínimo 16 caracteres, combinando letras, números y símbolos)
- Cambie el master password regularmente

## 🚀 Acceso al Panel

### URL de Acceso

```
https://tu-dominio.com/admin/master
```

O en desarrollo:
```
http://localhost:3000/admin/master
```

### Inicio de Sesión

1. Navegue a la URL del panel
2. Ingrese el master password
3. Haga clic en "Autenticar"

La sesión se mantiene activa mientras el navegador esté abierto (usando sessionStorage).

## 🛠️ Funcionalidades

### 1. Crear Usuarios Manualmente

Permite crear usuarios con cualquier rol directamente desde la interfaz web.

**Roles disponibles:**
- `SUPERADMIN`: Acceso total al sistema
- `ADMIN`: Administrador de tenant
- `MANAGER`: Gerente de sucursal
- `PROFESSIONAL`: Profesional/Staff
- `RECEPTIONIST`: Recepcionista

**Campos requeridos:**
- Email (único en el sistema)
- Contraseña
- Nombre
- Apellido
- Rol

**Campos opcionales:**
- Teléfono

**Uso desde línea de comandos:**
```bash
cd app
tsx scripts/admin/create-user.ts
```

### 2. Resetear Base de Datos

⚠️ **PELIGRO:** Esta operación elimina TODOS los datos de la base de datos de forma permanente.

**Proceso:**
1. Haga un backup antes de resetear
2. Haga clic en "Resetear Base de Datos"
3. Confirme la operación dos veces
4. La base de datos quedará completamente vacía

**Uso desde línea de comandos:**
```bash
cd app
tsx scripts/admin/reset-database.ts
```

**Orden de eliminación:**
1. Appointments
2. Payments
3. Inventory Movements
4. Inventory Items
5. Services
6. Clients
7. Users
8. Branches
9. Tenants

### 3. Hacer Backup de Base de Datos

Crea una copia completa de todos los datos en formato JSON.

**Características:**
- Incluye todos los datos de todas las tablas
- Genera archivo con timestamp: `backup_YYYY-MM-DD_HH-mm-ss.json`
- Se guarda en el directorio `/backups`
- Incluye metadata y estadísticas

**Uso desde línea de comandos:**
```bash
cd app
tsx scripts/admin/backup-database.ts
```

**Estructura del backup:**
```json
{
  "metadata": {
    "timestamp": "2025-10-02T10:30:00.000Z",
    "version": "1.0",
    "database": "citaplanner"
  },
  "data": {
    "tenants": [...],
    "branches": [...],
    "users": [...],
    ...
  },
  "stats": {
    "tenants": 5,
    "users": 20,
    ...
  }
}
```

### 4. Restaurar Backup

Restaura la base de datos desde un backup anterior.

⚠️ **ADVERTENCIA:** Esta operación reemplaza todos los datos actuales.

**Proceso:**
1. Seleccione un backup de la lista
2. Haga clic en "Restaurar Backup"
3. Confirme la operación
4. Los datos actuales serán reemplazados

**Uso desde línea de comandos:**
```bash
cd app
tsx scripts/admin/restore-database.ts backups/backup_2025-10-02_10-30-00.json
```

## 📁 Estructura de Archivos

```
app/
├── admin/
│   └── master/
│       └── page.tsx                    # Interfaz web del panel
├── api/
│   └── admin/
│       └── master/
│           ├── auth/
│           │   └── route.ts           # Autenticación
│           ├── create-user/
│           │   └── route.ts           # API crear usuario
│           ├── reset-database/
│           │   └── route.ts           # API resetear DB
│           ├── backup-database/
│           │   └── route.ts           # API crear backup
│           ├── restore-database/
│           │   └── route.ts           # API restaurar backup
│           └── backups/
│               └── route.ts           # API listar backups
├── lib/
│   └── master-auth.ts                 # Utilidades de autenticación
├── scripts/
│   └── admin/
│       ├── create-user.ts             # Script CLI crear usuario
│       ├── reset-database.ts          # Script CLI resetear DB
│       ├── backup-database.ts         # Script CLI crear backup
│       └── restore-database.ts        # Script CLI restaurar backup
└── backups/                           # Directorio de backups (auto-creado)
    └── backup_*.json
```

## 🔒 Mejores Prácticas de Seguridad

### 1. Master Password

- ✅ Use contraseñas de al menos 16 caracteres
- ✅ Combine letras mayúsculas, minúsculas, números y símbolos
- ✅ Cambie el password cada 3-6 meses
- ✅ No comparta el password por email o mensajes
- ✅ Use un gestor de contraseñas para almacenarlo
- ❌ Nunca use contraseñas comunes o predecibles
- ❌ Nunca guarde el password en texto plano

### 2. Acceso al Panel

- ✅ Acceda solo desde redes seguras
- ✅ Use HTTPS en producción
- ✅ Cierre sesión después de usar el panel
- ✅ Limite el acceso por IP si es posible
- ❌ No acceda desde redes públicas o WiFi abierto
- ❌ No deje la sesión abierta sin supervisión

### 3. Backups

- ✅ Haga backups antes de operaciones críticas
- ✅ Mantenga múltiples backups históricos
- ✅ Almacene backups en ubicación segura
- ✅ Pruebe la restauración periódicamente
- ✅ Documente qué contiene cada backup
- ❌ No confíe en un solo backup
- ❌ No elimine backups antiguos inmediatamente

### 4. Operaciones Críticas

- ✅ Lea las advertencias cuidadosamente
- ✅ Haga backup antes de resetear
- ✅ Verifique dos veces antes de confirmar
- ✅ Documente las operaciones realizadas
- ✅ Notifique al equipo sobre cambios importantes
- ❌ No realice operaciones bajo presión
- ❌ No ignore las confirmaciones de seguridad

## 🚨 Solución de Problemas

### Error: "MASTER_PASSWORD_HASH no está configurado"

**Causa:** La variable de entorno no está definida.

**Solución:**
1. Genere el hash del password
2. Agregue `MASTER_PASSWORD_HASH` a su archivo .env
3. Reinicie el servidor

### Error: "Master password incorrecto"

**Causa:** El password ingresado no coincide con el hash.

**Solución:**
1. Verifique que está usando el password correcto
2. Verifique que el hash en .env es el correcto
3. Regenere el hash si es necesario

### Error: "No hay tenant o sucursal disponible"

**Causa:** Intenta crear un usuario no-SUPERADMIN sin tenant/branch.

**Solución:**
1. Cree primero un tenant y branch
2. O cree un usuario SUPERADMIN que no requiere tenant/branch

### Backups no aparecen en la lista

**Causa:** El directorio /backups no existe o está vacío.

**Solución:**
1. Cree un backup desde el panel
2. Verifique que el directorio /backups existe
3. Verifique permisos de escritura

## 📝 Registro de Operaciones

Se recomienda mantener un registro manual de operaciones críticas:

```
Fecha: 2025-10-02 10:30:00
Operación: Backup de base de datos
Usuario: admin@citaplanner.com
Archivo: backup_2025-10-02_10-30-00.json
Motivo: Backup pre-producción
Resultado: Exitoso
```

## 🔄 Flujo de Trabajo Recomendado

### Antes de Producción

1. ✅ Configure el master password
2. ✅ Cree usuarios iniciales necesarios
3. ✅ Haga un backup completo
4. ✅ Pruebe la restauración del backup
5. ✅ Documente las credenciales de forma segura
6. ✅ Configure alertas de seguridad

### Durante Producción

1. ✅ Haga backups regulares (diarios/semanales)
2. ✅ Mantenga al menos 3 backups históricos
3. ✅ Monitoree el tamaño de los backups
4. ✅ Pruebe restauraciones periódicamente
5. ✅ Actualice la documentación

### En Caso de Emergencia

1. ✅ Identifique el backup más reciente válido
2. ✅ Notifique al equipo
3. ✅ Haga backup del estado actual (si es posible)
4. ✅ Restaure desde el backup
5. ✅ Verifique la integridad de los datos
6. ✅ Documente el incidente

## 📞 Soporte

Para problemas o preguntas sobre el Panel Master:

1. Revise esta documentación
2. Verifique los logs del servidor
3. Contacte al equipo de desarrollo
4. En emergencias, use los scripts CLI directamente

## 🔄 Actualizaciones

**Versión 1.0** (Octubre 2025)
- Implementación inicial
- Crear usuarios
- Resetear base de datos
- Backup y restore
- Interfaz web completa
- Scripts CLI

---

**Última actualización:** Octubre 2, 2025  
**Versión del documento:** 1.0  
**Mantenedor:** Equipo CitaPlanner
