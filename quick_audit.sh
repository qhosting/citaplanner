#!/bin/bash

echo "🔍 Auditoría Rápida de Links - CitaPlanner"
echo "=========================================="
echo ""

# Encontrar todas las rutas válidas
echo "📁 Buscando rutas válidas en app/..."
find app -type f \( -name "page.tsx" -o -name "page.ts" -o -name "layout.tsx" -o -name "route.ts" \) 2>/dev/null | \
  sed 's|app/||' | \
  sed 's|/page\.tsx$||' | \
  sed 's|/page\.ts$||' | \
  sed 's|/layout\.tsx$||' | \
  sed 's|/route\.ts$||' | \
  sed 's|(auth)/||g' | \
  sed 's|(dashboard)/||g' | \
  sed 's|^|/|' | \
  sort -u > /tmp/valid_routes.txt

echo "✓ Encontradas $(wc -l < /tmp/valid_routes.txt) rutas válidas"
echo ""

# Extraer todos los href de archivos TSX
echo "🔗 Extrayendo links de componentes..."
grep -r "href=" app --include="*.tsx" --include="*.ts" 2>/dev/null | \
  grep -oP 'href=["'\'']\K[^"'\'']+' | \
  sort -u > /tmp/all_links.txt

echo "✓ Encontrados $(wc -l < /tmp/all_links.txt) links únicos"
echo ""

# Separar por tipo
grep "^/" /tmp/all_links.txt | grep -v "^/api" > /tmp/internal_links.txt 2>/dev/null || touch /tmp/internal_links.txt
grep "^http" /tmp/all_links.txt > /tmp/external_links.txt 2>/dev/null || touch /tmp/external_links.txt
grep -E "^#|^javascript:" /tmp/all_links.txt > /tmp/empty_links.txt 2>/dev/null || touch /tmp/empty_links.txt

echo "📊 Resumen:"
echo "  - Links internos: $(wc -l < /tmp/internal_links.txt)"
echo "  - Links externos: $(wc -l < /tmp/external_links.txt)"
echo "  - Links vacíos: $(wc -l < /tmp/empty_links.txt)"
echo ""

# Verificar links rotos
echo "🔍 Verificando links internos..."
> /tmp/broken_links.txt
while IFS= read -r link; do
  clean_link=$(echo "$link" | cut -d'?' -f1 | cut -d'#' -f1)
  found=0
  while IFS= read -r route; do
    if [[ "$clean_link" == "$route" ]] || [[ "$clean_link" == "$route/"* ]]; then
      found=1
      break
    fi
  done < /tmp/valid_routes.txt
  
  if [ $found -eq 0 ]; then
    echo "$link" >> /tmp/broken_links.txt
  fi
done < /tmp/internal_links.txt

echo "✓ Análisis completado"
echo ""
echo "🚨 Links rotos encontrados: $(wc -l < /tmp/broken_links.txt)"

if [ -s /tmp/broken_links.txt ]; then
  echo ""
  echo "Links rotos:"
  cat /tmp/broken_links.txt
fi

