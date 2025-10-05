
import { NextResponse } from 'next/server'
import { isFirstTimeAccess, getMasterAuthConfig } from '@/lib/master-auth'

export async function GET() {
  try {
    const isFirstAccess = await isFirstTimeAccess()
    const config = await getMasterAuthConfig()

    return NextResponse.json({
      success: true,
      isFirstAccess,
      config: {
        hashSource: config.hashSource,
        hasDbPassword: config.hasDbPassword,
        isFirstAccess: config.isFirstAccess
      }
    })
  } catch (error) {
    console.error('[CHECK-FIRST-ACCESS] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error al verificar estado' },
      { status: 500 }
    )
  }
}
