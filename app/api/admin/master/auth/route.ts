
import { NextRequest, NextResponse } from 'next/server'
import { verifyMasterPassword } from '@/lib/master-auth'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Password requerido' },
        { status: 400 }
      )
    }

    const isValid = await verifyMasterPassword(password)

    if (isValid) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { success: false, error: 'Master password incorrecto' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Error en autenticación master:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
