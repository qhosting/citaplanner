#!/usr/bin/env python3
import os
import re
import json
import subprocess
from pathlib import Path
from collections import defaultdict
from urllib.parse import urlparse
import requests

class LinkAuditor:
    def __init__(self, repo_path):
        self.repo_path = Path(repo_path)
        self.results = {
            'internal_links': [],
            'external_links': [],
            'empty_links': [],
            'broken_links': [],
            'valid_links': [],
            'routes': set(),
            'issues': []
        }
        self.severity = {'critical': [], 'medium': [], 'low': []}
        
    def find_all_routes(self):
        """Encuentra todas las rutas válidas en app/"""
        routes = set()
        app_dir = self.repo_path / 'app'
        
        if not app_dir.exists():
            return routes
            
        # Buscar archivos page.tsx, page.ts, layout.tsx
        for file in app_dir.rglob('*'):
            if file.is_file() and file.name in ['page.tsx', 'page.ts', 'layout.tsx', 'route.ts']:
                # Construir la ruta desde app/
                rel_path = file.parent.relative_to(app_dir)
                route = '/' + str(rel_path).replace('\\', '/')
                
                # Limpiar rutas especiales
                if route == '/.':
                    route = '/'
                if '(auth)' in route:
                    route = route.replace('/(auth)', '')
                if '(dashboard)' in route:
                    route = route.replace('/(dashboard)', '')
                    
                routes.add(route)
                
        return routes
    
    def extract_links_from_file(self, file_path):
        """Extrae todos los links de un archivo"""
        links = []
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Patrones para diferentes tipos de links
            patterns = [
                r'href=["\']([^"\']+)["\']',  # href="..."
                r'to=["\']([^"\']+)["\']',     # to="..." (React Router)
                r'<Link[^>]+href=["\']([^"\']+)["\']',  # Next.js Link
                r'\[.*?\]\(([^)]+)\)',         # Markdown links
                r'url:\s*["\']([^"\']+)["\']', # url: "..."
            ]
            
            for pattern in patterns:
                matches = re.finditer(pattern, content, re.IGNORECASE)
                for match in matches:
                    link = match.group(1)
                    links.append({
                        'link': link,
                        'file': str(file_path.relative_to(self.repo_path)),
                        'line': content[:match.start()].count('\n') + 1
                    })
                    
        except Exception as e:
            print(f"Error leyendo {file_path}: {e}")
            
        return links
    
    def categorize_link(self, link_info):
        """Categoriza un link"""
        link = link_info['link']
        
        # Links vacíos o solo #
        if not link or link == '#' or link == 'javascript:void(0)':
            self.results['empty_links'].append(link_info)
            self.severity['low'].append({
                **link_info,
                'issue': 'Link vacío o placeholder',
                'recommendation': 'Implementar funcionalidad o remover'
            })
            return
            
        # Links externos
        if link.startswith('http://') or link.startswith('https://'):
            self.results['external_links'].append(link_info)
            return
            
        # Links internos (rutas de Next.js)
        if link.startswith('/'):
            self.results['internal_links'].append(link_info)
            return
            
        # Links relativos o especiales
        if link.startswith('./') or link.startswith('../') or link.startswith('mailto:') or link.startswith('tel:'):
            self.results['valid_links'].append(link_info)
            return
            
        # Otros
        self.results['internal_links'].append(link_info)
    
    def validate_internal_links(self):
        """Valida que los links internos apunten a rutas existentes"""
        valid_routes = self.find_all_routes()
        self.results['routes'] = valid_routes
        
        print(f"\n✓ Encontradas {len(valid_routes)} rutas válidas en la aplicación")
        
        for link_info in self.results['internal_links']:
            link = link_info['link']
            
            # Limpiar query params y hash
            clean_link = link.split('?')[0].split('#')[0]
            
            # Normalizar
            if not clean_link.startswith('/'):
                clean_link = '/' + clean_link
                
            # Verificar si existe
            found = False
            for route in valid_routes:
                if clean_link == route or clean_link.startswith(route + '/'):
                    found = True
                    break
                    
            if not found and clean_link not in ['/', '/api', '/api/auth']:
                self.results['broken_links'].append(link_info)
                self.severity['critical'].append({
                    **link_info,
                    'issue': f'Ruta no encontrada: {clean_link}',
                    'recommendation': f'Verificar que la ruta existe o corregir el link'
                })
            else:
                self.results['valid_links'].append(link_info)
    
    def validate_external_links(self):
        """Valida links externos (sample, no todos para no hacer muchas requests)"""
        print("\n✓ Validando muestra de links externos...")
        
        # Tomar solo una muestra
        sample = self.results['external_links'][:10]
        
        for link_info in sample:
            link = link_info['link']
            try:
                response = requests.head(link, timeout=5, allow_redirects=True)
                if response.status_code >= 400:
                    self.severity['medium'].append({
                        **link_info,
                        'issue': f'Link externo retorna {response.status_code}',
                        'recommendation': 'Verificar o actualizar el link'
                    })
            except Exception as e:
                self.severity['low'].append({
                    **link_info,
                    'issue': f'No se pudo validar link externo: {str(e)[:50]}',
                    'recommendation': 'Verificar manualmente'
                })
    
    def scan_repository(self):
        """Escanea todo el repositorio"""
        print("🔍 Iniciando auditoría de links...")
        
        # Archivos a escanear
        extensions = ['.tsx', '.ts', '.jsx', '.js', '.md', '.json']
        files_to_scan = []
        
        for ext in extensions:
            files_to_scan.extend(self.repo_path.rglob(f'*{ext}'))
        
        # Excluir node_modules, .git, .next
        files_to_scan = [
            f for f in files_to_scan 
            if 'node_modules' not in str(f) 
            and '.git' not in str(f)
            and '.next' not in str(f)
            and 'dist' not in str(f)
        ]
        
        print(f"✓ Encontrados {len(files_to_scan)} archivos para escanear")
        
        # Extraer links
        all_links = []
        for file_path in files_to_scan:
            links = self.extract_links_from_file(file_path)
            all_links.extend(links)
        
        print(f"✓ Extraídos {len(all_links)} links totales")
        
        # Categorizar
        for link_info in all_links:
            self.categorize_link(link_info)
        
        # Validar
        self.validate_internal_links()
        # self.validate_external_links()  # Comentado para no hacer muchas requests
        
    def generate_report(self):
        """Genera reporte en markdown"""
        report = []
        report.append("# 🔗 Auditoría de Links - CitaPlanner")
        report.append(f"\n**Fecha:** {subprocess.check_output(['date']).decode().strip()}")
        report.append(f"**Repositorio:** qhosting/citaplanner")
        report.append("\n---\n")
        
        # Resumen ejecutivo
        report.append("## 📊 Resumen Ejecutivo\n")
        report.append(f"- **Total de links encontrados:** {len(self.results['internal_links']) + len(self.results['external_links']) + len(self.results['empty_links'])}")
        report.append(f"- **Links internos:** {len(self.results['internal_links'])}")
        report.append(f"- **Links externos:** {len(self.results['external_links'])}")
        report.append(f"- **Links vacíos/placeholder:** {len(self.results['empty_links'])}")
        report.append(f"- **Links válidos:** {len(self.results['valid_links'])}")
        report.append(f"- **Links rotos:** {len(self.results['broken_links'])}")
        report.append(f"- **Rutas válidas encontradas:** {len(self.results['routes'])}")
        
        # Severidad
        report.append("\n### 🚨 Problemas por Severidad\n")
        report.append(f"- **Críticos:** {len(self.severity['critical'])} (rutas no encontradas)")
        report.append(f"- **Medios:** {len(self.severity['medium'])} (links externos con problemas)")
        report.append(f"- **Bajos:** {len(self.severity['low'])} (links vacíos o placeholders)")
        
        # Problemas críticos
        if self.severity['critical']:
            report.append("\n## 🔴 Problemas Críticos\n")
            for issue in self.severity['critical']:
                report.append(f"### {issue['file']}:{issue['line']}")
                report.append(f"- **Link:** `{issue['link']}`")
                report.append(f"- **Problema:** {issue['issue']}")
                report.append(f"- **Recomendación:** {issue['recommendation']}\n")
        
        # Problemas medios
        if self.severity['medium']:
            report.append("\n## 🟡 Problemas Medios\n")
            for issue in self.severity['medium'][:5]:  # Mostrar solo primeros 5
                report.append(f"### {issue['file']}:{issue['line']}")
                report.append(f"- **Link:** `{issue['link']}`")
                report.append(f"- **Problema:** {issue['issue']}")
                report.append(f"- **Recomendación:** {issue['recommendation']}\n")
        
        # Problemas bajos
        if self.severity['low']:
            report.append("\n## 🟢 Problemas Bajos\n")
            report.append(f"\nSe encontraron {len(self.severity['low'])} links vacíos o placeholders.\n")
            report.append("Ejemplos:\n")
            for issue in self.severity['low'][:5]:
                report.append(f"- `{issue['file']}:{issue['line']}` - {issue['link']}")
        
        # Rutas válidas
        report.append("\n## ✅ Rutas Válidas Encontradas\n")
        report.append("```")
        for route in sorted(self.results['routes']):
            report.append(route)
        report.append("```")
        
        # Links externos
        if self.results['external_links']:
            report.append("\n## 🌐 Links Externos Encontrados\n")
            report.append(f"\nTotal: {len(self.results['external_links'])}\n")
            report.append("Muestra de links externos:\n")
            for link_info in self.results['external_links'][:10]:
                report.append(f"- `{link_info['link']}` en `{link_info['file']}`")
        
        # Recomendaciones
        report.append("\n## 💡 Recomendaciones\n")
        if self.severity['critical']:
            report.append("1. **URGENTE:** Corregir los links rotos críticos que apuntan a rutas inexistentes")
        if self.severity['low']:
            report.append("2. Implementar funcionalidad para los links placeholder (#)")
        if self.results['external_links']:
            report.append("3. Validar periódicamente los links externos")
        
        report.append("\n---")
        report.append("\n*Auditoría generada automáticamente*")
        
        return '\n'.join(report)
    
    def save_json_report(self, output_file):
        """Guarda reporte en JSON"""
        data = {
            'summary': {
                'total_links': len(self.results['internal_links']) + len(self.results['external_links']) + len(self.results['empty_links']),
                'internal_links': len(self.results['internal_links']),
                'external_links': len(self.results['external_links']),
                'empty_links': len(self.results['empty_links']),
                'valid_links': len(self.results['valid_links']),
                'broken_links': len(self.results['broken_links']),
                'valid_routes': len(self.results['routes'])
            },
            'severity': {
                'critical': len(self.severity['critical']),
                'medium': len(self.severity['medium']),
                'low': len(self.severity['low'])
            },
            'issues': {
                'critical': self.severity['critical'],
                'medium': self.severity['medium'],
                'low': self.severity['low']
            },
            'routes': sorted(list(self.results['routes'])),
            'broken_links': self.results['broken_links']
        }
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

if __name__ == '__main__':
    auditor = LinkAuditor('/home/ubuntu/github_repos/citaplanner')
    auditor.scan_repository()
    
    # Generar reportes
    report_md = auditor.generate_report()
    
    with open('/home/ubuntu/github_repos/citaplanner/LINK_AUDIT_REPORT.md', 'w', encoding='utf-8') as f:
        f.write(report_md)
    
    auditor.save_json_report('/home/ubuntu/github_repos/citaplanner/link_audit_data.json')
    
    print("\n" + "="*60)
    print("✅ AUDITORÍA COMPLETADA")
    print("="*60)
    print(f"\n📄 Reporte guardado en: LINK_AUDIT_REPORT.md")
    print(f"📊 Datos JSON guardados en: link_audit_data.json")
    print("\n" + report_md)
