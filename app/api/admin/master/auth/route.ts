

import { NextRequest, NextResponse } from 'next/server'
import { verifyMasterPassword } from '@/lib/master-auth'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      console.warn('[WARN] Intento de autenticación sin password')
      return NextResponse.json(
        { success: false, error: 'Password requerido' },
        { status: 400 }
      )
    }

    console.log('[INFO] Intento de autenticación master')
    
    const isValid = await verifyMasterPassword(password)

    if (isValid) {
      console.log('[SUCCESS] Autenticación master exitosa')
      return NextResponse.json({ success: true })
    } else {
      console.warn('[WARN] Autenticación master fallida - password incorrecto')
      return NextResponse.json(
        { success: false, error: 'Master password incorrecto' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('[ERROR] Error en autenticación master:', error)
    if (error instanceof Error) {
      console.error('[ERROR] Mensaje:', error.message)
      console.error('[ERROR] Stack:', error.stack)
    }
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

