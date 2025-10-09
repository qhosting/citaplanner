
import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Leer la versión del package.json
    const packageJsonPath = join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    const version = packageJson.version || '1.0.0';

    // Obtener información de build desde variables de entorno
    const buildDate = process.env.BUILD_DATE || new Date().toISOString();
    const commitSha = process.env.GIT_COMMIT_SHA || 'unknown';

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
