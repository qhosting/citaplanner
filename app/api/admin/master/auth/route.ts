
import { NextRequest, NextResponse } from 'next/server'
import { verifyMasterPassword } from '@/lib/master-auth'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      console.warn('[MASTER-AUTH] ⚠️  Intento de autenticación sin password')
      return NextResponse.json(
        { success: false, error: 'Password requerido' },
        { status: 400 }
      )
    }

    console.log('[MASTER-AUTH] 🔐 Iniciando verificación de master password')
    console.log('[MASTER-AUTH] 📊 Password length:', password.length)
    console.log('[MASTER-AUTH] 🔍 Password preview:', password.substring(0, 3) + '***')
    
    const isValid = await verifyMasterPassword(password)

    if (isValid) {
      console.log('[MASTER-AUTH] ✅ Autenticación master EXITOSA')
      return NextResponse.json({ success: true })
    } else {
      console.warn('[MASTER-AUTH] ❌ Autenticación master FALLIDA - password incorrecto')
      console.warn('[MASTER-AUTH] 💡 Tip: Verifique que está usando el password correcto')
      return NextResponse.json(
        { success: false, error: 'Master password incorrecto' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('[MASTER-AUTH] 🔥 ERROR CRÍTICO en autenticación master:', error)
    if (error instanceof Error) {
      console.error('[MASTER-AUTH] 📝 Mensaje:', error.message)
      console.error('[MASTER-AUTH] 📚 Stack:', error.stack)
    }
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
