
# CitaPlanner MVP

**Plataforma SaaS integral para la gestión de negocios basados en citas**

CitaPlanner es una solución completa que permite a los negocios de servicios (salones de belleza, spas, clínicas, etc.) gestionar eficientemente sus citas, clientes, servicios e inventario.

## 🚀 Características Principales

### ✅ Módulos Completados:
- **📅 Gestión de Citas** - Sistema completo de agendamiento con estados y seguimiento
- **👥 Gestión de Clientes** - Base de datos de clientes con historial completo
- **📦 Inventario Completo** - Control total de productos, stock, alertas y reabastecimiento
- **🏢 Multi-tenant** - Soporte para múltiples empresas en una sola instalación
- **🔐 Sistema de Autenticación** - NextAuth.js con roles y permisos
- **📊 Dashboard Analítico** - Métricas y reportes en tiempo real
- **💳 Procesamiento de Pagos** - Integración con OpenPay para México
- **📱 Notificaciones** - SMS y WhatsApp para recordatorios
- **🎨 Interfaz Moderna** - Diseño responsive con Tailwind CSS

### 🛠️ Tecnologías Utilizadas:
- **Frontend:** Next.js 14, React 18, TypeScript
- **Styling:** Tailwind CSS, Shadcn/ui Components
- **Backend:** Next.js API Routes, Prisma ORM
- **Base de Datos:** PostgreSQL
- **Autenticación:** NextAuth.js
- **Pagos:** OpenPay Integration
- **Forms:** React Hook Form + Zod validation
- **Estado:** Zustand
- **Notificaciones:** React Hot Toast

## 🏗️ Arquitectura Multi-tenant

El sistema está diseñado para soportar múltiples empresas:
- Cada empresa (tenant) tiene sus propios datos aislados
- Usuarios con diferentes roles: SUPERADMIN, ADMIN, MANAGER, PROFESSIONAL, RECEPTIONIST, CLIENT
- Gestión de sucursales múltiples por empresa
- Configuraciones personalizables por tenant

## 🐳 Despliegue con Docker (Recomendado)

### Sistema de Inicialización Automática

CitaPlanner incluye un sistema de inicialización automática que configura todo lo necesario en el primer despliegue:

✅ **Características:**
- Ejecuta migraciones de base de datos automáticamente
- Inserta datos de ejemplo (solo si la BD está vacía)
- Configura el Master Admin password
- Verifica la integridad del sistema antes de iniciar
- Totalmente idempotente (seguro ejecutar múltiples veces)

### Variables de Entorno Requeridas

```bash
# Base de datos PostgreSQL (REQUERIDA)
DATABASE_URL=postgresql://user:password@host:5432/citaplanner

# Master Admin Password (OPCIONAL - usa default si no se especifica)
MASTER_PASSWORD_HASH=$2b$10$P/AV363LeWhZGK0kkrON3eGmAlkmiTHKuzZzDKCAppFV.0Gzf0ZaO

# Next.js (configuradas automáticamente)
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
PORT=3000
```

### Primer Despliegue

1. **Configurar variables de entorno** en Easypanel/Docker
2. **Desplegar el contenedor** - El sistema se inicializará automáticamente
3. **Acceder a la aplicación** en `https://tu-dominio.com`

### Datos de Ejemplo Creados

El sistema crea automáticamente:
- 🏢 1 Empresa: "Bella Vita Spa & Wellness"
- 🏪 1 Sucursal: "Sucursal Centro"
- 👥 5 Usuarios con diferentes roles
- 💆 6 Servicios de ejemplo
- 👤 6 Clientes de prueba
- 📅 6 Citas de ejemplo
- 💳 3 Pagos registrados

### Credenciales de Acceso

**Usuarios del Sistema:**
```
Admin:         admin@citaplanner.com / admin123
Manager:       manager@citaplanner.com / manager123
Profesional 1: pro1@citaplanner.com / prof123
Profesional 2: pro2@citaplanner.com / prof123
Recepcionista: recepcionista@citaplanner.com / prof123
```

**Master Admin Panel:**
```
URL:      https://tu-dominio.com/admin/master
Password: x0420EZS2025*
```

⚠️ **IMPORTANTE:** Cambia todas las contraseñas después del primer login.

### Documentación Completa

Para más detalles sobre el sistema de inicialización, consulta:
- 📖 [Documentación de Inicialización](docs/DEPLOY_INITIALIZATION.md)

---

## 📦 Instalación Local (Desarrollo)

### Prerrequisitos:
- Node.js 18+ 
- PostgreSQL
- Yarn

### Pasos:

1. **Clonar el repositorio:**
```bash
git clone <tu-repo-url>
cd citaplanner_mvp
```

2. **Instalar dependencias:**
```bash
cd app
yarn install
```

3. **Configurar variables de entorno:**
```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Configurar las siguientes variables:
DATABASE_URL="postgresql://user:password@localhost:5432/citaplanner"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-secret-key"

# Para OpenPay (opcional):
OPENPAY_ID="tu-merchant-id"
OPENPAY_PRIVATE_KEY="tu-private-key"
OPENPAY_PUBLIC_KEY="tu-public-key"
```

4. **Configurar la base de datos:**
```bash
# Generar Prisma Client
yarn prisma generate

# Ejecutar migraciones
yarn prisma db push

# Sembrar datos de prueba (opcional)
yarn prisma db seed
```

5. **Iniciar el servidor de desarrollo:**
```bash
yarn dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🔧 Scripts Disponibles

```bash
# Desarrollo
yarn dev

# Build de producción
yarn build

# Iniciar en producción
yarn start

# Linting
yarn lint

# Base de datos
yarn prisma studio      # Interfaz visual de la BD
yarn prisma db push     # Aplicar cambios del schema
yarn prisma generate    # Generar cliente
```

## 📁 Estructura del Proyecto

```
app/
├── app/                    # App Router (Next.js 14)
│   ├── admin/             # Panel de administración
│   ├── api/               # API Routes
│   ├── auth/              # Páginas de autenticación
│   ├── dashboard/         # Dashboard principal
│   └── book/              # Portal de reservas público
├── components/            # Componentes reutilizables
│   ├── ui/                # Componentes base (Shadcn)
│   ├── modals/            # Modales del sistema
│   └── charts/            # Gráficos y visualizaciones
├── lib/                   # Utilidades y configuraciones
├── prisma/                # Schema y migraciones de BD
└── public/                # Archivos estáticos
```

## 🎯 Funcionalidades por Rol

### Super Administrador
- Gestión de tenants (empresas)
- Configuración global del sistema
- Métricas generales

### Administrador de Empresa
- Gestión completa de la empresa
- Configuración de sucursales
- Gestión de personal y servicios
- Reportes y análisis
- **Inventario completo con alertas de stock**

### Manager/Profesional
- Gestión de citas propias
- Ver clientes asignados
- Actualizar servicios

### Recepcionista
- Gestión de citas de la sucursal
- Registrar pagos
- Gestión básica de clientes

## 💡 Funcionalidades Destacadas del Inventario

- ✅ **Modal completo** con 3 modos: Crear, Editar, Reabastecer
- ✅ **Generación automática de SKU**
- ✅ **Cálculo de márgenes de ganancia**
- ✅ **Alertas de stock bajo** con código de colores
- ✅ **Filtros avanzados** por categoría y estado
- ✅ **Reabastecimiento masivo** inteligente
- ✅ **Dashboard con estadísticas** completas

## 🔄 Próximas Características

- [ ] Sistema de horarios avanzado
- [ ] Integración con calendarios externos
- [ ] App móvil (React Native)
- [ ] Sistema de fidelización de clientes
- [ ] Reportes avanzados con IA
- [ ] Integración con más pasarelas de pago

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

Para soporte técnico o consultas:
- 📧 Email: soporte@citaplanner.com
- 📚 Documentación: [docs.citaplanner.com](https://docs.citaplanner.com)
- 🐛 Issues: [GitHub Issues](https://github.com/tu-usuario/citaplanner-mvp/issues)

---

**Desarrollado con ❤️ para revolucionar la gestión de citas en México**
