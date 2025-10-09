import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Leer la versión desde variables de entorno generadas en build time
    // El script prebuild (generate-version.sh) genera estas variables
    const version = process.env.APP_VERSION || process.env.NEXT_PUBLIC_APP_VERSION || '1.3.0';
    const buildDate = process.env.BUILD_DATE || process.env.NEXT_PUBLIC_BUILD_DATE || new Date().toISOString();
    const commitSha = process.env.GIT_COMMIT_SHA || process.env.NEXT_PUBLIC_GIT_COMMIT_SHA || 'unknown';

    return NextResponse.json({
      success: true,
      data: {
        version,
        buildDate,
        commit: commitSha,
        environment: process.env.NODE_ENV || 'development'
      }
    });
  } catch (error) {
    console.error('Error al obtener información de versión:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener información de versión'
      },
      { status: 500 }
    );
  }
}
