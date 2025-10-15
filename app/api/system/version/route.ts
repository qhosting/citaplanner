import { NextResponse } from 'next/server'
import packageJson from '@/../package.json'

/**
 * GET /api/system/version
 * Obtiene la versión actual del sistema
 * 
 * @returns {object} - Información de versión del sistema
 */
export async function GET() {
  try {
    const version = packageJson.version
    const gitCommitSha = process.env.GIT_COMMIT_SHA || 'unknown'
    const buildDate = process.env.BUILD_DATE || 'unknown'
    const appVersion = process.env.APP_VERSION || version

    return NextResponse.json(
      {
        success: true,
        data: {
          version: appVersion,
          gitCommitSha,
          buildDate,
          environment: process.env.NODE_ENV || 'development'
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error obteniendo versión del sistema:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error obteniendo versión del sistema'
      },
      { status: 500 }
    )
  }
}
