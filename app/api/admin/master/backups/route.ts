
import { NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'
import dayjs from 'dayjs'

export async function GET() {
  try {
    const backupDir = path.join(process.cwd(), 'backups')

    if (!fs.existsSync(backupDir)) {
      return NextResponse.json({ success: true, backups: [] })
    }

    const files = fs.readdirSync(backupDir)
      .filter(f => f.endsWith('.json'))
      .map(filename => {
        const filePath = path.join(backupDir, filename)
        const stats = fs.statSync(filePath)
        const sizeMB = (stats.size / 1024 / 1024).toFixed(2)
        
        return {
          filename,
          size: `${sizeMB} MB`,
          date: dayjs(stats.mtime).format('DD/MM/YYYY HH:mm:ss')
        }
      })
      .sort((a, b) => b.filename.localeCompare(a.filename))

    return NextResponse.json({ success: true, backups: files })
  } catch (error) {
    console.error('Error al listar backups:', error)
    return NextResponse.json(
      { success: false, error: 'Error al listar backups' },
      { status: 500 }
    )
  }
}
