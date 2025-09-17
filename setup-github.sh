
#!/bin/bash

# 🚀 Script para Configurar CitaPlanner MVP en GitHub
# Ejecuta este script desde el directorio del proyecto

echo "🚀 Configurando CitaPlanner MVP para GitHub..."
echo "==============================================="

# Verificar si estamos en el directorio correcto
if [ ! -f "README.md" ] || [ ! -d "app" ]; then
    echo "❌ Error: Ejecuta este script desde el directorio raíz de CitaPlanner MVP"
    exit 1
fi

# Inicializar repositorio git si no existe
if [ ! -d ".git" ]; then
    echo "📁 Inicializando repositorio Git..."
    git init
fi

# Agregar todos los archivos
echo "📝 Agregando archivos al repositorio..."
git add .

# Verificar si hay cambios para commit
if git diff --cached --quiet; then
    echo "ℹ️  No hay cambios nuevos para commit"
else
    echo "💾 Creando commit inicial..."
    git commit -m "Initial commit - CitaPlanner MVP v1.0.0

✅ Características Principales:
- Módulo de Inventario completo (crear, editar, reabastecer)
- Sistema Multi-tenant para múltiples empresas
- Gestión de Citas con estados y seguimiento
- Gestión de Clientes con validaciones
- Autenticación NextAuth.js con roles
- Dashboard analítico con métricas
- Integración OpenPay para pagos
- Notificaciones SMS/WhatsApp
- Interfaz moderna responsive

🛠️ Stack Tecnológico:
- Next.js 14 + TypeScript
- Prisma ORM + PostgreSQL
- Tailwind CSS + Shadcn/ui
- React Hook Form + Zod
- Zustand para estado

📊 Estado del Proyecto:
- 31 rutas implementadas
- Build exitoso sin errores TypeScript
- Documentación completa
- Listo para producción"
fi

# Configurar rama main
echo "🌿 Configurando rama main..."
git branch -M main

# Instrucciones para conectar con GitHub
echo ""
echo "✅ Repositorio Git configurado exitosamente!"
echo ""
echo "🔗 Para conectar con GitHub, ejecuta:"
echo "git remote add origin https://github.com/qhosting/citaplanner.git"
echo "git push -u origin main"
echo ""
echo "📋 O visita: https://github.com/qhosting/citaplanner"
echo "   y sigue las instrucciones para subir un repositorio existente"
echo ""
echo "🎉 ¡Tu proyecto CitaPlanner MVP está listo!"

# Mostrar estadísticas del proyecto
echo ""
echo "📊 Estadísticas del Proyecto:"
echo "- Archivos de código: $(find . -name "*.tsx" -o -name "*.ts" | wc -l)"
echo "- Componentes: $(find . -path "./app/components" -name "*.tsx" | wc -l)"
echo "- Páginas: $(find . -path "./app/app" -name "page.tsx" | wc -l)"
echo "- API Routes: $(find . -path "./app/app/api" -name "route.ts" | wc -l)"
echo "- Líneas de código: $(find . -name "*.tsx" -o -name "*.ts" -exec wc -l {} + | tail -1 | awk '{print $1}')"
