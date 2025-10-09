#!/bin/bash

echo "🔍 AUDITORÍA COMPLETA DE LINKS - CitaPlanner"
echo "============================================="
echo ""

# 1. Encontrar todas las rutas válidas
echo "📁 Paso 1: Identificando rutas válidas..."
find app/app -type f -name "page.tsx" 2>/dev/null | \
  sed 's|app/app||' | \
  sed 's|/page\.tsx$||' | \
  sed 's|^$|/|' | \
  sort -u > /tmp/valid_routes.txt

echo "✓ Encontradas $(wc -l < /tmp/valid_routes.txt) rutas válidas"
echo ""

# 2. Extraer todos los links
echo "🔗 Paso 2: Extrayendo todos los links..."
grep -rh "href=" app --include="*.tsx" --include="*.ts" 2>/dev/null | \
  grep -oP 'href=["'\'']\K[^"'\'']+' | \
  sort -u > /tmp/all_links.txt

echo "✓ Encontrados $(wc -l < /tmp/all_links.txt) links únicos"
echo ""

# 3. Categorizar links
echo "📊 Paso 3: Categorizando links..."
grep "^/" /tmp/all_links.txt | grep -v "^/api" | grep -v "^/_next" > /tmp/internal_links.txt 2>/dev/null || touch /tmp/internal_links.txt
grep "^http" /tmp/all_links.txt > /tmp/external_links.txt 2>/dev/null || touch /tmp/external_links.txt
grep -E "^#$|^javascript:" /tmp/all_links.txt > /tmp/placeholder_links.txt 2>/dev/null || touch /tmp/placeholder_links.txt

echo "  - Links internos: $(wc -l < /tmp/internal_links.txt)"
echo "  - Links externos: $(wc -l < /tmp/external_links.txt)"
echo "  - Placeholders: $(wc -l < /tmp/placeholder_links.txt)"
echo ""

# 4. Verificar links internos
echo "🔍 Paso 4: Verificando links internos contra rutas válidas..."
> /tmp/broken_links.txt
> /tmp/valid_internal_links.txt

while IFS= read -r link; do
  clean_link=$(echo "$link" | cut -d'?' -f1 | cut -d'#' -f1)
  
  # Verificar si existe exactamente
  if grep -Fxq "$clean_link" /tmp/valid_routes.txt; then
    echo "$link" >> /tmp/valid_internal_links.txt
  else
    # Verificar si es una ruta dinámica
    found=0
    while IFS= read -r route; do
      # Verificar rutas dinámicas [id]
      if [[ "$route" == *"[id]"* ]]; then
        base_route=$(echo "$route" | sed 's|\[id\].*||')
        if [[ "$clean_link" == "$base_route"* ]]; then
          found=1
          break
        fi
      fi
    done < /tmp/valid_routes.txt
    
    if [ $found -eq 0 ]; then
      echo "$link" >> /tmp/broken_links.txt
    else
      echo "$link" >> /tmp/valid_internal_links.txt
    fi
  fi
done < /tmp/internal_links.txt

echo "  ✅ Links válidos: $(wc -l < /tmp/valid_internal_links.txt)"
echo "  ❌ Links rotos: $(wc -l < /tmp/broken_links.txt)"
echo ""

# 5. Generar reporte detallado
echo "📝 Paso 5: Generando reporte..."

cat > LINK_AUDIT_REPORT.md << 'REPORT_EOF'
# 🔗 Auditoría de Links - CitaPlanner

**Fecha:** $(date)
**Repositorio:** qhosting/citaplanner
**Rama:** main

---

## 📊 Resumen Ejecutivo

REPORT_EOF

echo "- **Total de links encontrados:** $(wc -l < /tmp/all_links.txt)" >> LINK_AUDIT_REPORT.md
echo "- **Links internos:** $(wc -l < /tmp/internal_links.txt)" >> LINK_AUDIT_REPORT.md
echo "- **Links externos:** $(wc -l < /tmp/external_links.txt)" >> LINK_AUDIT_REPORT.md
echo "- **Placeholders (#):** $(wc -l < /tmp/placeholder_links.txt)" >> LINK_AUDIT_REPORT.md
echo "- **Links internos válidos:** $(wc -l < /tmp/valid_internal_links.txt)" >> LINK_AUDIT_REPORT.md
echo "- **Links rotos:** $(wc -l < /tmp/broken_links.txt)" >> LINK_AUDIT_REPORT.md
echo "- **Rutas válidas en la app:** $(wc -l < /tmp/valid_routes.txt)" >> LINK_AUDIT_REPORT.md
echo "" >> LINK_AUDIT_REPORT.md

# Severidad
if [ -s /tmp/broken_links.txt ]; then
  echo "### 🚨 Estado: REQUIERE ATENCIÓN" >> LINK_AUDIT_REPORT.md
  echo "" >> LINK_AUDIT_REPORT.md
  echo "Se encontraron **$(wc -l < /tmp/broken_links.txt) links rotos** que necesitan corrección." >> LINK_AUDIT_REPORT.md
else
  echo "### ✅ Estado: EXCELENTE" >> LINK_AUDIT_REPORT.md
  echo "" >> LINK_AUDIT_REPORT.md
  echo "No se encontraron links rotos. Todos los links internos apuntan a rutas válidas." >> LINK_AUDIT_REPORT.md
fi

echo "" >> LINK_AUDIT_REPORT.md
echo "---" >> LINK_AUDIT_REPORT.md
echo "" >> LINK_AUDIT_REPORT.md

# Links rotos
if [ -s /tmp/broken_links.txt ]; then
  echo "## 🔴 Links Rotos Encontrados" >> LINK_AUDIT_REPORT.md
  echo "" >> LINK_AUDIT_REPORT.md
  
  while IFS= read -r broken_link; do
    echo "### Link: \`$broken_link\`" >> LINK_AUDIT_REPORT.md
    echo "" >> LINK_AUDIT_REPORT.md
    echo "**Ubicaciones:**" >> LINK_AUDIT_REPORT.md
    echo '```' >> LINK_AUDIT_REPORT.md
    grep -rn "href=[\"']$broken_link[\"']" app --include="*.tsx" --include="*.ts" 2>/dev/null | head -5 >> LINK_AUDIT_REPORT.md
    echo '```' >> LINK_AUDIT_REPORT.md
    echo "" >> LINK_AUDIT_REPORT.md
    
    # Sugerir corrección
    echo "**Posible corrección:**" >> LINK_AUDIT_REPORT.md
    similar=$(grep "$broken_link" /tmp/valid_routes.txt | head -1)
    if [ -n "$similar" ]; then
      echo "- Ruta similar encontrada: \`$similar\`" >> LINK_AUDIT_REPORT.md
    else
      echo "- Verificar si la ruta debe existir o si el link es incorrecto" >> LINK_AUDIT_REPORT.md
    fi
    echo "" >> LINK_AUDIT_REPORT.md
  done < /tmp/broken_links.txt
fi

# Placeholders
if [ -s /tmp/placeholder_links.txt ]; then
  echo "## 🟡 Links Placeholder" >> LINK_AUDIT_REPORT.md
  echo "" >> LINK_AUDIT_REPORT.md
  echo "Se encontraron **$(wc -l < /tmp/placeholder_links.txt) links placeholder** (\`#\` o \`javascript:void(0)\`)." >> LINK_AUDIT_REPORT.md
  echo "Estos links no causan errores pero deberían implementarse eventualmente." >> LINK_AUDIT_REPORT.md
  echo "" >> LINK_AUDIT_REPORT.md
fi

# Rutas válidas
echo "## ✅ Rutas Válidas en la Aplicación" >> LINK_AUDIT_REPORT.md
echo "" >> LINK_AUDIT_REPORT.md
echo '```' >> LINK_AUDIT_REPORT.md
cat /tmp/valid_routes.txt >> LINK_AUDIT_REPORT.md
echo '```' >> LINK_AUDIT_REPORT.md
echo "" >> LINK_AUDIT_REPORT.md

# Links externos (muestra)
if [ -s /tmp/external_links.txt ]; then
  echo "## 🌐 Links Externos (Muestra)" >> LINK_AUDIT_REPORT.md
  echo "" >> LINK_AUDIT_REPORT.md
  echo "Total de links externos: $(wc -l < /tmp/external_links.txt)" >> LINK_AUDIT_REPORT.md
  echo "" >> LINK_AUDIT_REPORT.md
  echo "Muestra de los primeros 10:" >> LINK_AUDIT_REPORT.md
  echo '```' >> LINK_AUDIT_REPORT.md
  head -10 /tmp/external_links.txt >> LINK_AUDIT_REPORT.md
  echo '```' >> LINK_AUDIT_REPORT.md
  echo "" >> LINK_AUDIT_REPORT.md
fi

# Recomendaciones
echo "## 💡 Recomendaciones" >> LINK_AUDIT_REPORT.md
echo "" >> LINK_AUDIT_REPORT.md

if [ -s /tmp/broken_links.txt ]; then
  echo "1. **URGENTE:** Corregir los $(wc -l < /tmp/broken_links.txt) links rotos identificados" >> LINK_AUDIT_REPORT.md
  echo "2. Verificar que las rutas existen o corregir los links" >> LINK_AUDIT_REPORT.md
  echo "3. Ejecutar pruebas de navegación después de las correcciones" >> LINK_AUDIT_REPORT.md
else
  echo "1. ✅ Todos los links internos están correctos" >> LINK_AUDIT_REPORT.md
  echo "2. Considerar implementar funcionalidad para los links placeholder" >> LINK_AUDIT_REPORT.md
  echo "3. Mantener esta auditoría como parte del proceso de CI/CD" >> LINK_AUDIT_REPORT.md
fi

echo "" >> LINK_AUDIT_REPORT.md
echo "---" >> LINK_AUDIT_REPORT.md
echo "" >> LINK_AUDIT_REPORT.md
echo "*Auditoría generada automáticamente el $(date)*" >> LINK_AUDIT_REPORT.md

echo "✅ Reporte generado: LINK_AUDIT_REPORT.md"
echo ""

# Mostrar resumen en consola
echo "============================================="
echo "RESUMEN DE AUDITORÍA"
echo "============================================="
echo ""
if [ -s /tmp/broken_links.txt ]; then
  echo "🔴 ESTADO: REQUIERE ATENCIÓN"
  echo ""
  echo "Links rotos encontrados:"
  cat /tmp/broken_links.txt
else
  echo "✅ ESTADO: EXCELENTE"
  echo ""
  echo "No se encontraron links rotos."
fi
echo ""
echo "Detalles completos en: LINK_AUDIT_REPORT.md"

