
import { NextRequest, NextResponse } from 'next/server'
import { verifyMasterPassword, getMasterAuthConfig, isFirstTimeAccess } from '@/lib/master-auth'

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7)
  
  try {
    console.log(`[MASTER-AUTH:${requestId}] 🚀 === NUEVA SOLICITUD DE AUTENTICACIÓN ===`)
    console.log(`[MASTER-AUTH:${requestId}] 📅 Timestamp:`, new Date().toISOString())
    console.log(`[MASTER-AUTH:${requestId}] 🌐 URL:`, request.url)
    console.log(`[MASTER-AUTH:${requestId}] 📍 Method:`, request.method)
    
    // Verificar si es primer acceso
    const isFirstAccess = await isFirstTimeAccess()
    console.log(`[MASTER-AUTH:${requestId}] 🎯 Primer acceso: ${isFirstAccess}`)
    
    // Si es primer acceso, permitir entrada sin contraseña
    if (isFirstAccess) {
      console.log(`[MASTER-AUTH:${requestId}] 🎉 ========================================`)
      console.log(`[MASTER-AUTH:${requestId}] 🎉 PRIMER ACCESO - ENTRADA SIN CONTRASEÑA`)
      console.log(`[MASTER-AUTH:${requestId}] 🎉 ========================================`)
      
      return NextResponse.json({ 
        success: true,
        isFirstAccess: true,
        message: 'Primer acceso - configure su contraseña',
        debug: {
          requestId,
          timestamp: new Date().toISOString(),
          isFirstAccess: true
        }
      })
    }
    
    // Obtener configuración del sistema
    const config = await getMasterAuthConfig()
    console.log(`[MASTER-AUTH:${requestId}] ⚙️  Configuración del sistema:`)
    console.log(`[MASTER-AUTH:${requestId}]   - Hash source: ${config.hashSource}`)
    console.log(`[MASTER-AUTH:${requestId}]   - Using ENV hash: ${config.usingEnvHash}`)
    console.log(`[MASTER-AUTH:${requestId}]   - Debug enabled: ${config.debugEnabled}`)
    console.log(`[MASTER-AUTH:${requestId}]   - Hash format valid: ${config.isValidFormat}`)
    console.log(`[MASTER-AUTH:${requestId}]   - Hash prefix: ${config.hashPrefix}`)
    console.log(`[MASTER-AUTH:${requestId}]   - Has DB password: ${config.hasDbPassword}`)

    // Parsear el body
    let body
    try {
      body = await request.json()
      console.log(`[MASTER-AUTH:${requestId}] 📦 Body parseado exitosamente`)
      console.log(`[MASTER-AUTH:${requestId}] 🔑 Keys en body:`, Object.keys(body))
    } catch (parseError) {
      console.error(`[MASTER-AUTH:${requestId}] ❌ ERROR al parsear JSON:`, parseError)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Body inválido - debe ser JSON válido',
          debug: {
            requestId,
            parseError: parseError instanceof Error ? parseError.message : 'Unknown error'
          }
        },
        { status: 400 }
      )
    }

    const { password } = body

    // Validar que el password existe
    if (!password) {
      console.warn(`[MASTER-AUTH:${requestId}] ⚠️  Password no proporcionado`)
      console.warn(`[MASTER-AUTH:${requestId}] 📋 Body recibido:`, JSON.stringify(body))
      return NextResponse.json(
        { 
          success: false, 
          error: 'Password requerido',
          debug: {
            requestId,
            receivedKeys: Object.keys(body),
            expectedKey: 'password'
          }
        },
        { status: 400 }
      )
    }

    // Validar tipo de password
    if (typeof password !== 'string') {
      console.warn(`[MASTER-AUTH:${requestId}] ⚠️  Password no es string`)
      console.warn(`[MASTER-AUTH:${requestId}] 📋 Tipo recibido:`, typeof password)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Password debe ser un string',
          debug: {
            requestId,
            receivedType: typeof password
          }
        },
        { status: 400 }
      )
    }

    console.log(`[MASTER-AUTH:${requestId}] 🔐 Iniciando verificación de master password`)
    console.log(`[MASTER-AUTH:${requestId}] 📊 Password length: ${password.length}`)
    console.log(`[MASTER-AUTH:${requestId}] 🔍 Password preview: ${password.substring(0, 3)}***`)
    console.log(`[MASTER-AUTH:${requestId}] 🔍 Password ends with: ***${password.substring(password.length - 3)}`)
    
    // Verificar el password
    const startTime = Date.now()
    const isValid = await verifyMasterPassword(password)
    const duration = Date.now() - startTime

    console.log(`[MASTER-AUTH:${requestId}] ⏱️  Verificación completada en ${duration}ms`)

    if (isValid) {
      console.log(`[MASTER-AUTH:${requestId}] ✅ ========================================`)
      console.log(`[MASTER-AUTH:${requestId}] ✅ AUTENTICACIÓN MASTER EXITOSA`)
      console.log(`[MASTER-AUTH:${requestId}] ✅ ========================================`)
      
      return NextResponse.json({ 
        success: true,
        debug: {
          requestId,
          timestamp: new Date().toISOString(),
          verificationTime: `${duration}ms`
        }
      })
    } else {
      console.warn(`[MASTER-AUTH:${requestId}] ❌ ========================================`)
      console.warn(`[MASTER-AUTH:${requestId}] ❌ AUTENTICACIÓN MASTER FALLIDA`)
      console.warn(`[MASTER-AUTH:${requestId}] ❌ ========================================`)
      console.warn(`[MASTER-AUTH:${requestId}] 💡 Diagnóstico:`)
      console.warn(`[MASTER-AUTH:${requestId}]   1. Password length: ${password.length}`)
      console.warn(`[MASTER-AUTH:${requestId}]   2. Hash source: ${config.hashSource}`)
      console.warn(`[MASTER-AUTH:${requestId}]   3. Hash format: ${config.isValidFormat ? 'válido' : 'INVÁLIDO'}`)
      console.warn(`[MASTER-AUTH:${requestId}]   4. Verification time: ${duration}ms`)
      console.warn(`[MASTER-AUTH:${requestId}] 💡 Posibles causas:`)
      console.warn(`[MASTER-AUTH:${requestId}]   - Password incorrecto`)
      console.warn(`[MASTER-AUTH:${requestId}]   - Espacios extra al inicio/final`)
      console.warn(`[MASTER-AUTH:${requestId}]   - Hash configurado incorrectamente`)
      console.warn(`[MASTER-AUTH:${requestId}]   - Problema con bcrypt`)
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Master password incorrecto',
          debug: {
            requestId,
            passwordLength: password.length,
            hashSource: config.hashSource,
            hashFormatValid: config.isValidFormat,
            verificationTime: `${duration}ms`,
            timestamp: new Date().toISOString()
          }
        },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error(`[MASTER-AUTH:${requestId}] 🔥 ========================================`)
    console.error(`[MASTER-AUTH:${requestId}] 🔥 ERROR CRÍTICO EN AUTENTICACIÓN MASTER`)
    console.error(`[MASTER-AUTH:${requestId}] 🔥 ========================================`)
    console.error(`[MASTER-AUTH:${requestId}] 📝 Error:`, error)
    
    if (error instanceof Error) {
      console.error(`[MASTER-AUTH:${requestId}] 📝 Mensaje:`, error.message)
      console.error(`[MASTER-AUTH:${requestId}] 📝 Nombre:`, error.name)
      console.error(`[MASTER-AUTH:${requestId}] 📚 Stack:`, error.stack)
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        debug: {
          requestId,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          errorName: error instanceof Error ? error.name : 'Unknown',
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    )
  }
}
