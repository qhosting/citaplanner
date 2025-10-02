/**
 * Ruta de debug temporal para verificar configuración de MASTER_PASSWORD_HASH
 * IMPORTANTE: Eliminar después de resolver el problema
 */

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const masterPasswordHash = process.env.MASTER_PASSWORD_HASH
    
    // Información de debug sin exponer el hash completo
    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      hashConfigured: !!masterPasswordHash,
      hashLength: masterPasswordHash?.length || 0,
      hashPrefix: masterPasswordHash ? masterPasswordHash.substring(0, 7) : 'N/A',
      hashSuffix: masterPasswordHash ? masterPasswordHash.substring(masterPasswordHash.length - 4) : 'N/A',
      hashFormat: {
        startsWithDollar2a: masterPasswordHash?.startsWith('$2a$') || false,
        startsWithDollar2b: masterPasswordHash?.startsWith('$2b$') || false,
        startsWithDollar2y: masterPasswordHash?.startsWith('$2y$') || false,
      },
      expectedHashLength: 60, // bcrypt hashes son típicamente 60 caracteres
      allEnvVars: Object.keys(process.env).filter(key => 
        key.includes('MASTER') || key.includes('PASSWORD') || key.includes('HASH')
      ),
    }

    // Advertencia de seguridad
    console.warn('[SECURITY] Ruta de debug accedida - Esta ruta debe ser eliminada en producción')

    return NextResponse.json({
      success: true,
      debug: debugInfo,
      warning: 'Esta es una ruta de debug temporal. Eliminar después de resolver el problema.',
      instructions: {
        step1: 'Verificar que hashConfigured sea true',
        step2: 'Verificar que hashLength sea 60',
        step3: 'Verificar que hashPrefix sea $2a$, $2b$ o $2y$',
        step4: 'Si todo está correcto, el problema puede estar en el password o en cómo se pasa la variable de entorno',
        step5: 'Probar el script de test local: npm run test:hash o node scripts/test-hash.js'
      }
    })
  } catch (error) {
    console.error('[ERROR] Error en ruta de debug:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener información de debug',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
