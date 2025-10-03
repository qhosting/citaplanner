
import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function GET() {
  try {
    // Leer el archivo de versión generado durante el build
    const versionPath = join(process.cwd(), 'version.json')
    let versionData = {
      version: 'dev',
      buildDate: new Date().toISOString(),
      commit: 'unknown',
      branch: 'unknown'
    }

    try {
      const versionContent = readFileSync(versionPath, 'utf-8')
      versionData = JSON.parse(versionContent)
    } catch (error) {
      console.warn('[VERSION] No se pudo leer version.json, usando valores por defecto')
    }

    return NextResponse.json({
      success: true,
      ...versionData,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('[VERSION] Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener versión',
        version: 'unknown'
      },
      { status: 500 }
    )
  }
}
