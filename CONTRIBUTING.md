
# 🤝 Guía de Contribución - CitaPlanner MVP

¡Gracias por tu interés en contribuir a CitaPlanner! Esta guía te ayudará a empezar.

## 🚀 Cómo Contribuir

### 1. Fork y Clone
```bash
# Fork el repositorio en GitHub
# Luego clona tu fork
git clone https://github.com/tu-usuario/citaplanner-mvp.git
cd citaplanner-mvp
```

### 2. Configurar el Entorno
```bash
cd app
yarn install
cp .env.example .env
# Configurar tu base de datos local
yarn prisma db push
```

### 3. Crear una Rama
```bash
git checkout -b feature/mi-nueva-funcionalidad
# o
git checkout -b fix/corregir-bug-x
```

### 4. Hacer Cambios
- Sigue las convenciones de código existentes
- Agrega tests cuando sea necesario
- Actualiza documentación si es relevante

### 5. Commit y Push
```bash
git add .
git commit -m "feat: agregar nueva funcionalidad X"
git push origin feature/mi-nueva-funcionalidad
```

### 6. Pull Request
- Ve a GitHub y crea un Pull Request
- Describe claramente qué cambios hiciste
- Incluye screenshots si hay cambios de UI

## 📋 Convenciones

### Commits
Usamos [Conventional Commits](https://conventionalcommits.org/):
```
feat: nueva funcionalidad
fix: corrección de bug
docs: cambios en documentación
style: formato, no cambia lógica
refactor: refactorización de código
test: agregar o modificar tests
chore: tareas de mantenimiento
```

### Código
- **TypeScript estricto** - sin `any`
- **Componentes funcionales** con hooks
- **Nombres descriptivos** para variables y funciones
- **Comentarios** para lógica compleja
- **Responsive design** siempre

### Estructura de Carpetas
```
app/
├── app/           # Pages y layouts
├── components/    # Componentes reutilizables
├── lib/          # Utilidades y configuración
├── hooks/        # Custom hooks
├── types/        # Definiciones de tipos
└── styles/       # Estilos globales
```

## 🐛 Reportar Bugs

### Antes de Reportar
1. Busca en issues existentes
2. Verifica que sea reproducible
3. Prueba en la última versión

### Template de Bug Report
```markdown
**Descripción del Bug**
Descripción clara y concisa del problema.

**Pasos para Reproducir**
1. Ve a '...'
2. Haz clic en '...'
3. Observa el error

**Comportamiento Esperado**
Qué esperabas que pasara.

**Screenshots**
Si aplican, agrega capturas de pantalla.

**Entorno**
- OS: [e.g. macOS, Windows, Linux]
- Browser: [e.g. Chrome, Firefox, Safari]
- Versión: [e.g. 22]
```

## 💡 Sugerir Funcionalidades

### Template de Feature Request
```markdown
**¿Tu feature request está relacionada con un problema?**
Una descripción clara del problema. Ej: "Me frustra cuando..."

**Describe la solución que te gustaría**
Una descripción clara de lo que quieres que pase.

**Describe alternativas consideradas**
Cualquier solución alternativa que hayas considerado.

**Contexto adicional**
Cualquier otro contexto o screenshots sobre el feature request.
```

## 🧪 Testing

### Ejecutar Tests
```bash
# Tests unitarios
yarn test

# Tests de integración
yarn test:integration

# E2E tests
yarn test:e2e
```

### Escribir Tests
```typescript
// Ejemplo de test para componente
import { render, screen } from '@testing-library/react'
import { AppointmentModal } from './appointment-modal'

describe('AppointmentModal', () => {
  it('should render correctly', () => {
    render(
      <AppointmentModal 
        isOpen={true}
        onClose={() => {}}
        mode="create"
      />
    )
    
    expect(screen.getByText('Nueva Cita')).toBeInTheDocument()
  })
})
```

## 📝 Documentación

### Actualizando README
- Mantén el README actualizado
- Incluye nuevas funcionalidades
- Actualiza screenshots si es necesario

### Comentarios en Código
```typescript
/**
 * Calcula el margen de ganancia de un producto
 * @param precio - Precio de venta del producto
 * @param costo - Costo del producto
 * @returns Porcentaje de margen (0-100)
 */
function calcularMargen(precio: number, costo: number): number {
  return ((precio - costo) / precio) * 100
}
```

## 🎯 Áreas de Contribución

### 🔥 Alta Prioridad
- [ ] Sistema de horarios avanzado
- [ ] Mejoras en reportes
- [ ] Optimizaciones de performance
- [ ] Tests de componentes

### 🚀 Media Prioridad  
- [ ] Integración con más pasarelas de pago
- [ ] Sistema de notificaciones mejorado
- [ ] PWA (Progressive Web App)
- [ ] Internacionalización (i18n)

### 💡 Baja Prioridad
- [ ] Temas personalizables
- [ ] Plugins de terceros
- [ ] API pública
- [ ] Documentación técnica

## ❓ ¿Necesitas Ayuda?

- 💬 **Discussions**: Para preguntas generales
- 🐛 **Issues**: Para bugs y features
- 📧 **Email**: contribuciones@citaplanner.com
- 📚 **Wiki**: Documentación técnica detallada

## 🏆 Reconocimientos

Los contribuidores aparecerán automáticamente en:
- README principal
- Release notes  
- Wall of Fame

¡Gracias por hacer CitaPlanner mejor! 🎉
