
# CitaPlanner

Sistema de gestión de citas para múltiples negocios.

## 🆕 Última Actualización: Persistencia Completa de Base de Datos

**Versión**: 1.0.0 | **Fecha**: 9 de Octubre, 2025

### ✨ Nuevas Características

- ✅ **Persistencia Total**: Los datos nunca se pierden entre deployments
- ✅ **Backups Automáticos**: Sistema de respaldo diario, semanal y mensual
- ✅ **Seed Idempotente**: Datos iniciales sin duplicación
- ✅ **Fácil Restauración**: Proceso simple para recuperar datos
- ✅ **Verificación de Integridad**: Checksums y validación automática

### 📚 Documentación Nueva

- [Guía Completa de Persistencia](./docs/DB-PERSISTENCIA.md)
- [Configuración de Volúmenes en Easypanel](./docs/EASYPANEL-VOLUME-CONFIG.md)
- [Guía Rápida de Backup y Restauración](./docs/BACKUP-RESTORE-GUIDE.md)
- [Checklist de Deployment](./DEPLOYMENT-CHECKLIST.md)

## 🚀 Despliegue Rápido en Easypanel

CitaPlanner incluye un sistema completo de automatización para Easypanel que configura todo automáticamente.

### Requisitos Previos

1. Cuenta en Easypanel con acceso a tu servidor
2. Token de API de Easypanel (Settings > Users > Generate API Key)
3. Node.js v18 o superior

### Configuración Automática

1. **Configura tus credenciales de Easypanel:**

```bash
export EASYPANEL_URL="https://adm.whatscloud.site"
export EASYPANEL_TOKEN="tu-token-de-api"
```

2. **Ejecuta el script de automatización:**

```bash
npm install
node scripts/setup-easypanel.js
```

El script automáticamente:
- ✅ Crea el proyecto en Easypanel
- ✅ Configura PostgreSQL con credenciales seguras
- ✅ Genera el archivo `.env` con todas las variables
- ✅ Configura las variables de entorno en Easypanel
- ✅ Valida toda la configuración

3. **Configura el servicio de la aplicación en Easypanel:**

   - Ve a tu proyecto en Easypanel
   - Crea un nuevo servicio "App"
   - Conecta el repositorio de GitHub
   - Copia las variables de entorno del archivo `.env` generado
   - Despliega la aplicación

### Documentación Completa

Para más detalles sobre el proceso de automatización, consulta:
- [Guía de Automatización de Easypanel](docs/easypanel_automation.md)

## 📋 Características

- 🏢 Gestión multi-negocio
- 📅 Sistema de citas y reservas
- 👥 Gestión de clientes
- 💼 Panel de administración
- 📊 Reportes y estadísticas
- 🔐 Autenticación segura
- 📱 Diseño responsive

## 🛠️ Tecnologías

- **Frontend:** Next.js 14, React, TailwindCSS
- **Backend:** Next.js API Routes, Prisma ORM
- **Base de Datos:** PostgreSQL
- **Autenticación:** NextAuth.js
- **Despliegue:** Easypanel (Docker)

## 📖 Documentación

- [Guía de Automatización de Easypanel](docs/easypanel_automation.md)
- [Configuración de Variables de Entorno](.env.example)
- [Configuración de Easypanel](easypanel.config.json)

## 🔧 Desarrollo Local

1. **Clonar el repositorio:**

```bash
git clone https://github.com/qhosting/citaplanner.git
cd citaplanner
```

2. **Instalar dependencias:**

```bash
npm install
```

3. **Configurar variables de entorno:**

```bash
cp .env.example .env
# Edita .env con tus valores
```

4. **Configurar base de datos:**

```bash
npx prisma migrate dev
npx prisma generate
```

5. **Iniciar servidor de desarrollo:**

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🔐 Seguridad

- Todas las contraseñas se almacenan con hash bcrypt
- Autenticación basada en sesiones con NextAuth.js
- Variables de entorno para credenciales sensibles
- HTTPS obligatorio en producción

## 📝 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta el linter
- `node scripts/setup-easypanel.js` - Automatización de Easypanel
- `node scripts/generate-env.js` - Genera archivo .env con valores seguros

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📧 Contacto

Para soporte o consultas, abre un issue en el repositorio de GitHub.

---

**Desarrollado con ❤️ para la gestión eficiente de citas**
