
import { NextRequest, NextResponse } from 'next/server'
import { saveMasterPassword, isFirstTimeAccess } from '@/lib/master-auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { newPassword, currentPassword } = body

    if (!newPassword) {
      return NextResponse.json(
        { success: false, error: 'Nueva contraseña requerida' },
        { status: 400 }
      )
    }

    const isFirstAccess = await isFirstTimeAccess()

    // Si no es primer acceso, requerir contraseña actual
    if (!isFirstAccess && !currentPassword) {
      return NextResponse.json(
        { success: false, error: 'Contraseña actual requerida' },
        { status: 400 }
      )
    }

    // Guardar la nueva contraseña
    const result = await saveMasterPassword(newPassword, currentPassword)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: isFirstAccess 
          ? 'Contraseña master configurada exitosamente' 
          : 'Contraseña master actualizada exitosamente',
        isFirstTimeSetup: isFirstAccess
      })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('[SET-PASSWORD] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
