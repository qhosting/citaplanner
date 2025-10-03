
/**
 * Endpoint público de versión
 * Retorna información sobre la versión actual de la aplicación
 */

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Información de versión desde variables de entorno (generadas en build time)
    const versionInfo = {
      version: process.env.APP_VERSION || '1.0.0',
      commitSha: process.env.GIT_COMMIT_SHA || 'unknown',
      buildDate: process.env.BUILD_DATE || 'unknown',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: versionInfo
    })
  } catch (error) {
    console.error('[ERROR] Error en endpoint de versión:', error)
    
    // Manejo robusto de errores
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    if (errorStack) {
      console.error('[ERROR] Stack trace:', errorStack)
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener información de versión',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}
