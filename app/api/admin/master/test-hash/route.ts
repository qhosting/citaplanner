
import { NextRequest, NextResponse } from 'next/server'
import { getMasterAuthConfig, verifyMasterPassword } from '@/lib/master-auth'

/**
 * Endpoint temporal de diagnóstico para verificar la configuración del master password
 * 
 * IMPORTANTE: Este endpoint debe ser removido en producción por seguridad
 * Solo debe usarse para debugging durante desarrollo
 */
export async function GET(request: NextRequest) {
  try {
    const config = getMasterAuthConfig()
    
    // Test con el password por defecto
    const testPassword = 'x0420EZS2025*'
    const isValid = await verifyMasterPassword(testPassword)
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      config: {
        hashSource: config.hashSource,
        usingEnvHash: config.usingEnvHash,
        debugEnabled: config.debugEnabled,
        hashPrefix: config.hashPrefix,
        hashLength: config.hashLength,
        isValidFormat: config.isValidFormat
      },
      test: {
        password: testPassword,
        isValid,
        message: isValid 
          ? '✅ El password por defecto funciona correctamente' 
          : '❌ El password por defecto NO funciona - revisar configuración'
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasMasterPasswordHash: !!process.env.MASTER_PASSWORD_HASH,
        hasDebugEnabled: !!process.env.ENABLE_MASTER_DEBUG
      },
      recommendations: [
        config.usingEnvHash 
          ? '✅ Usando hash de variable de entorno (recomendado)' 
          : '⚠️  Usando hash hardcoded - considere usar MASTER_PASSWORD_HASH',
        config.debugEnabled 
          ? '🔍 Debug habilitado - útil para diagnóstico' 
          : '💡 Habilite debug con ENABLE_MASTER_DEBUG=true para más información',
        isValid 
          ? '✅ Configuración correcta - el sistema está funcionando' 
          : '❌ Configuración incorrecta - revisar hash y password'
      ]
    })
  } catch (error) {
    console.error('[TEST-HASH] Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al ejecutar test',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Endpoint POST para probar un password específico
 */
export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()
    
    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Password requerido' },
        { status: 400 }
      )
    }
    
    const config = getMasterAuthConfig()
    const isValid = await verifyMasterPassword(password)
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      config: {
        hashSource: config.hashSource,
        debugEnabled: config.debugEnabled
      },
      test: {
        passwordLength: password.length,
        isValid,
        message: isValid 
          ? '✅ Password correcto' 
          : '❌ Password incorrecto'
      }
    })
  } catch (error) {
    console.error('[TEST-HASH] Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al ejecutar test',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
