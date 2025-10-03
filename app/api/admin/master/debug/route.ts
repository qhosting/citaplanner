
/**
 * Ruta de debug temporal para verificar configuración de MASTER_PASSWORD_HASH
 * IMPORTANTE: Solo funciona si ENABLE_MASTER_DEBUG está configurado como 'true' o '1'
 */

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Verificar si el debug está habilitado
    const debugEnabled = process.env.ENABLE_MASTER_DEBUG === 'true' || process.env.ENABLE_MASTER_DEBUG === '1'
    
    if (!debugEnabled) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Debug endpoint is disabled',
          message: 'Set ENABLE_MASTER_DEBUG=true or ENABLE_MASTER_DEBUG=1 to enable this endpoint'
        },
        { status: 404 }
      )
    }

    const masterPasswordHash = process.env.MASTER_PASSWORD_HASH
    const hasFallback = true // Ahora siempre hay un fallback hardcoded
    
    // Información de debug sin exponer el hash completo
    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      hashSource: masterPasswordHash ? 'environment variable' : 'hardcoded fallback',
      hashConfigured: !!masterPasswordHash,
      hasFallbackHash: hasFallback,
      hashLength: masterPasswordHash?.length || 60, // El fallback tiene 60 caracteres
      hashPrefix: masterPasswordHash ? masterPasswordHash.substring(0, 7) : '$2b$10$',
      hashSuffix: masterPasswordHash ? masterPasswordHash.substring(masterPasswordHash.length - 4) : 'ZaO',
      hashFormat: {
        startsWithDollar2a: masterPasswordHash?.startsWith('$2a$') || false,
        startsWithDollar2b: masterPasswordHash?.startsWith('$2b$') || true, // El fallback es $2b$
        startsWithDollar2y: masterPasswordHash?.startsWith('$2y$') || false,
      },
      expectedHashLength: 60, // bcrypt hashes son típicamente 60 caracteres
      allEnvVars: Object.keys(process.env).filter(key => 
        key.includes('MASTER') || key.includes('PASSWORD') || key.includes('HASH')
      ),
      // Información de versión
      version: {
        appVersion: process.env.APP_VERSION || 'unknown',
        commitSha: process.env.GIT_COMMIT_SHA || 'unknown',
        buildDate: process.env.BUILD_DATE || 'unknown',
      }
    }

    // Advertencia de seguridad
    console.warn('[SECURITY] Ruta de debug accedida - Esta ruta debe ser eliminada en producción')

    return NextResponse.json({
      success: true,
      debug: debugInfo,
      warning: 'Esta es una ruta de debug temporal. Eliminar después de resolver el problema.',
      instructions: {
        step1: 'Verificar que hashSource indique la fuente correcta (env var o fallback)',
        step2: 'Verificar que hashLength sea 60',
        step3: 'Verificar que hashPrefix sea $2a$, $2b$ o $2y$',
        step4: 'Si todo está correcto, el problema puede estar en el password ingresado',
        step5: 'Probar el script de test local: npm run test:hash o node scripts/test-hash.js',
        note: 'Ahora hay un hash hardcoded como fallback, por lo que siempre debería funcionar'
      }
    })
  } catch (error) {
    console.error('[ERROR] Error en ruta de debug:', error)
    
    // Manejo robusto de errores
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    if (errorStack) {
      console.error('[ERROR] Stack trace:', errorStack)
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener información de debug',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}
