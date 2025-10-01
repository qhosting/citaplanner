
# CitaPlanner 📅

Sistema de gestión de citas y planificación desarrollado con Next.js, Prisma y PostgreSQL.

## 🚀 Características

- Gestión completa de citas
- Autenticación de usuarios con NextAuth
- Base de datos PostgreSQL persistente
- Deploy fácil en Easypanel
- Interfaz moderna y responsive

## 📋 Requisitos previos

- Node.js 18 o superior
- PostgreSQL 14 o superior (para desarrollo local)
- Cuenta en Easypanel (para producción)
- Base de datos PostgreSQL externa (Neon, Supabase, Railway, etc.)

## 🛠️ Instalación y desarrollo local

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/citaplanner.git
cd citaplanner
```

### 2. Instalar dependencias

```bash
cd app
yarn install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la carpeta `app/`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/citaplanner"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-secret-generado"
JWT_SECRET="tu-jwt-secret-generado"
```

Para generar los secrets:
```bash
openssl rand -base64 32
```

### 4. Iniciar base de datos local con Docker

```bash
# Desde la raíz del proyecto
docker-compose up -d
```

Esto iniciará PostgreSQL en `localhost:5432`.

### 5. Ejecutar migraciones

```bash
cd app
npx prisma generate
npx prisma db push
npx prisma db seed  # Opcional: datos de prueba
```

### 6. Iniciar servidor de desarrollo

```bash
yarn dev
```

La aplicación estará disponible en `http://localhost:3000`.

## 🌐 Deploy en producción (Easypanel)

### Opción recomendada: Base de datos externa

Para evitar pérdida de datos en cada deploy, usa una base de datos PostgreSQL externa.

**📖 [Guía completa de configuración de base de datos externa](docs/external-database-setup.md)**

### Pasos rápidos:

1. **Crear base de datos externa** (recomendado: [Neon](https://neon.tech) o [Supabase](https://supabase.com))

2. **Configurar variables de entorno en Easypanel**:
   - `DATABASE_URL`: Tu cadena de conexión PostgreSQL
   - `NEXTAUTH_URL`: URL de tu aplicación
   - `NEXTAUTH_SECRET`: Secret generado con `openssl rand -base64 32`
   - `JWT_SECRET`: Secret generado con `openssl rand -base64 32`
   - `NODE_ENV`: `production`
   - `PORT`: `3000`

3. **Conectar repositorio GitHub** en Easypanel

4. **Seleccionar `docker-compose.easypanel.yml`** como archivo de configuración

5. **Deploy** - Las migraciones se ejecutarán automáticamente

### Proveedores de base de datos recomendados:

| Proveedor | Plan Gratuito | Ventajas |
|-----------|---------------|----------|
| [Neon](https://neon.tech) | 512 MB | ✅ No requiere whitelist de IPs, serverless |
| [Supabase](https://supabase.com) | 500 MB | ✅ Incluye auth y storage, dashboard completo |
| [Railway](https://railway.app) | $5/mes crédito | ✅ Muy fácil de usar, métricas en tiempo real |
| [Render](https://render.com) | 90 días retención | ✅ Backups automáticos, SSL incluido |

Ver [documentación completa](docs/external-database-setup.md) para más detalles.

## 📁 Estructura del proyecto

```
citaplanner/
├── app/                          # Aplicación Next.js
│   ├── app/                      # App Router de Next.js
│   ├── components/               # Componentes React
│   ├── lib/                      # Utilidades y configuración
│   ├── prisma/                   # Schema y migraciones de Prisma
│   ├── public/                   # Archivos estáticos
│   └── package.json
├── docs/                         # Documentación
│   └── external-database-setup.md
├── docker-compose.yml            # Para desarrollo local
├── docker-compose.easypanel.yml  # Para producción en Easypanel
├── Dockerfile                    # Imagen de producción
├── start.sh                      # Script de inicio
└── README.md
```

## 🔧 Scripts disponibles

```bash
# Desarrollo
yarn dev              # Inicia servidor de desarrollo
yarn build            # Construye para producción
yarn start            # Inicia servidor de producción

# Base de datos
npx prisma generate   # Genera cliente Prisma
npx prisma db push    # Sincroniza esquema con BD
npx prisma db seed    # Ejecuta seed de datos
npx prisma studio     # Abre interfaz visual de BD

# Docker
docker-compose up -d              # Inicia servicios (desarrollo)
docker-compose down               # Detiene servicios
docker-compose logs -f app        # Ver logs
```

## 🐛 Solución de problemas

### La aplicación no se conecta a la base de datos

1. Verifica que `DATABASE_URL` esté correctamente configurada
2. Verifica que la base de datos esté accesible
3. Si usas SSL, agrega `?sslmode=require` al final de la URL
4. Revisa los logs en Easypanel

### Los datos se pierden después de cada deploy

Esto ocurre si usas una base de datos local en el contenedor. **Solución**: Configura una base de datos externa siguiendo la [guía de configuración](docs/external-database-setup.md).

### Error "Prisma Client not found"

```bash
# Regenera el cliente Prisma
npx prisma generate
```

### Error de migraciones

```bash
# Resetea y sincroniza el esquema
npx prisma db push --force-reset --accept-data-loss
```

⚠️ **Advertencia**: Esto borrará todos los datos. Úsalo solo en desarrollo.

## 📚 Documentación adicional

- [Configuración de base de datos externa](docs/external-database-setup.md)
- [Documentación de Prisma](https://www.prisma.io/docs)
- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de NextAuth](https://next-auth.js.org)

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Autores

- Tu Nombre - [@tu-usuario](https://github.com/tu-usuario)

## 🙏 Agradecimientos

- Next.js team
- Prisma team
- Easypanel
- Comunidad open source

---

**¿Necesitas ayuda?** Abre un [issue](https://github.com/tu-usuario/citaplanner/issues) en GitHub.

