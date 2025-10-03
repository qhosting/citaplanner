
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Shield, UserPlus, Database, Download, Upload, AlertTriangle, CheckCircle, Loader2, Info, Code, Settings } from 'lucide-react'
import { toast } from 'sonner'

interface Backup {
  filename: string
  size: string
  date: string
}

interface VersionInfo {
  version: string
  buildDate: string
  commit: string
  branch: string
  environment: string
}

interface SystemConfig {
  hashSource: string
  usingEnvHash: boolean
  debugEnabled: boolean
  hashPrefix: string
  isValidFormat: boolean
}

export default function MasterAdminPanel() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [masterPassword, setMasterPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null)
  const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null)

  // Estados para crear usuario
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'PROFESSIONAL'
  })

  // Estados para backups
  const [backups, setBackups] = useState<Backup[]>([])
  const [selectedBackup, setSelectedBackup] = useState('')

  // Cargar información del sistema
  useEffect(() => {
    loadVersionInfo()
    loadSystemConfig()
  }, [])

  // Verificar autenticación al cargar
  useEffect(() => {
    const authStatus = sessionStorage.getItem('masterAuth')
    if (authStatus === 'true') {
      setIsAuthenticated(true)
      loadBackups()
    }
  }, [])

  const loadVersionInfo = async () => {
    try {
      const response = await fetch('/api/version')
      const data = await response.json()
      if (data.success) {
        setVersionInfo(data)
      }
    } catch (error) {
      console.error('Error al cargar versión:', error)
    }
  }

  const loadSystemConfig = async () => {
    try {
      const response = await fetch('/api/admin/master/test-hash')
      const data = await response.json()
      if (data.success) {
        setSystemConfig(data.config)
      }
    } catch (error) {
      console.error('Error al cargar configuración:', error)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/master/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: masterPassword })
      })

      const data = await response.json()

      if (data.success) {
        setIsAuthenticated(true)
        sessionStorage.setItem('masterAuth', 'true')
        toast.success('Autenticación exitosa')
        loadBackups()
      } else {
        toast.error('Master password incorrecto')
      }
    } catch (error) {
      toast.error('Error al autenticar')
      console.error(error)
    } finally {
      setIsLoading(false)
      setMasterPassword('')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem('masterAuth')
    toast.info('Sesión cerrada')
  }

  const loadBackups = async () => {
    try {
      const response = await fetch('/api/admin/master/backups')
      const data = await response.json()
      if (data.success) {
        setBackups(data.backups)
      }
    } catch (error) {
      console.error('Error al cargar backups:', error)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/master/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Usuario creado exitosamente')
        setNewUser({
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          phone: '',
          role: 'PROFESSIONAL'
        })
      } else {
        toast.error(data.error || 'Error al crear usuario')
      }
    } catch (error) {
      toast.error('Error al crear usuario')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetDatabase = async () => {
    if (!confirm('⚠️ ADVERTENCIA: Esto eliminará TODOS los datos de la base de datos. ¿Está seguro?')) {
      return
    }

    if (!confirm('Esta acción NO se puede deshacer. Confirme nuevamente.')) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/master/reset-database', {
        method: 'POST'
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Base de datos reseteada exitosamente')
      } else {
        toast.error(data.error || 'Error al resetear base de datos')
      }
    } catch (error) {
      toast.error('Error al resetear base de datos')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackupDatabase = async () => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/master/backup-database', {
        method: 'POST'
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`Backup creado: ${data.filename}`)
        loadBackups()
      } else {
        toast.error(data.error || 'Error al crear backup')
      }
    } catch (error) {
      toast.error('Error al crear backup')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRestoreDatabase = async () => {
    if (!selectedBackup) {
      toast.error('Seleccione un backup para restaurar')
      return
    }

    if (!confirm('⚠️ ADVERTENCIA: Esto reemplazará todos los datos actuales con el backup seleccionado. ¿Está seguro?')) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/master/restore-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: selectedBackup })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Base de datos restaurada exitosamente')
      } else {
        toast.error(data.error || 'Error al restaurar base de datos')
      }
    } catch (error) {
      toast.error('Error al restaurar base de datos')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  // Pantalla de login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-12 w-12 text-red-500" />
            </div>
            <CardTitle className="text-2xl text-center">Panel de Administración Master</CardTitle>
            <CardDescription className="text-center">
              Ingrese el master password para acceder
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="masterPassword">Master Password</Label>
                <Input
                  id="masterPassword"
                  type="password"
                  value={masterPassword}
                  onChange={(e) => setMasterPassword(e.target.value)}
                  placeholder="Ingrese master password"
                  required
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Autenticar
                  </>
                )}
              </Button>
            </form>

            {/* Información del sistema */}
            {(versionInfo || systemConfig) && (
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Info className="h-4 w-4" />
                  <span className="font-medium">Información del Sistema</span>
                </div>
                
                {versionInfo && (
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Versión:</span>
                      <Badge variant="outline">{versionInfo.version}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Entorno:</span>
                      <Badge variant={versionInfo.environment === 'production' ? 'default' : 'secondary'}>
                        {versionInfo.environment}
                      </Badge>
                    </div>
                    {versionInfo.commit !== 'unknown' && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Commit:</span>
                        <code className="text-xs">{versionInfo.commit.substring(0, 7)}</code>
                      </div>
                    )}
                  </div>
                )}

                {systemConfig && (
                  <div className="space-y-1 text-xs pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Master Password:</span>
                      <Badge variant={systemConfig.usingEnvHash ? 'default' : 'secondary'}>
                        {systemConfig.usingEnvHash ? 'ENV Variable' : 'Hardcoded'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Debug Mode:</span>
                      <Badge variant={systemConfig.debugEnabled ? 'default' : 'outline'}>
                        {systemConfig.debugEnabled ? 'Habilitado' : 'Deshabilitado'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Hash Format:</span>
                      <Badge variant={systemConfig.isValidFormat ? 'default' : 'destructive'}>
                        {systemConfig.isValidFormat ? 'Válido' : 'Inválido'}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            )}

            <Alert className="mt-4 border-yellow-500/50 bg-yellow-500/10">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-yellow-500">
                Este panel permite realizar operaciones críticas. Use con precaución.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Panel principal
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-red-500" />
            <div>
              <h1 className="text-3xl font-bold text-white">Panel Master</h1>
              <p className="text-slate-400">Operaciones administrativas críticas</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {versionInfo && (
              <Badge variant="outline" className="text-xs">
                v{versionInfo.version}
              </Badge>
            )}
            <Button variant="outline" onClick={handleLogout}>
              Cerrar Sesión
            </Button>
          </div>
        </div>

        {/* Información del sistema */}
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-400" />
              <CardTitle className="text-lg">Configuración del Sistema</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Versión */}
              {versionInfo && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Versión del Sistema</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Code className="h-4 w-4 text-blue-400" />
                      <span className="font-mono text-sm">{versionInfo.version}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Build: {new Date(versionInfo.buildDate).toLocaleDateString('es-ES')}
                    </div>
                    {versionInfo.commit !== 'unknown' && (
                      <div className="text-xs text-muted-foreground">
                        Commit: {versionInfo.commit.substring(0, 7)}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Master Password Config */}
              {systemConfig && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Master Password</div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={systemConfig.usingEnvHash ? 'default' : 'secondary'}>
                        {systemConfig.usingEnvHash ? '🔐 ENV Variable' : '📝 Hardcoded'}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {systemConfig.usingEnvHash 
                        ? 'Usando MASTER_PASSWORD_HASH de variables de entorno' 
                        : 'Usando hash hardcoded por defecto'}
                    </div>
                    <div className="text-xs font-mono text-muted-foreground">
                      Hash: {systemConfig.hashPrefix}...
                    </div>
                  </div>
                </div>
              )}

              {/* Debug Mode */}
              {systemConfig && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Modo Debug</div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={systemConfig.debugEnabled ? 'default' : 'outline'}>
                        {systemConfig.debugEnabled ? '🔍 Habilitado' : '🔒 Deshabilitado'}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {systemConfig.debugEnabled 
                        ? 'ENABLE_MASTER_DEBUG=true - Logs detallados activos' 
                        : 'Debug deshabilitado - Habilitar con ENABLE_MASTER_DEBUG=true'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Alert de seguridad */}
        <Alert className="border-red-500/50 bg-red-500/10">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-400">
            <strong>Advertencia:</strong> Las operaciones en este panel son irreversibles y pueden afectar todo el sistema.
            Asegúrese de hacer backups antes de realizar cambios críticos.
          </AlertDescription>
        </Alert>

        {/* Tabs principales */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="users">
              <UserPlus className="mr-2 h-4 w-4" />
              Usuarios
            </TabsTrigger>
            <TabsTrigger value="database">
              <Database className="mr-2 h-4 w-4" />
              Base de Datos
            </TabsTrigger>
            <TabsTrigger value="backups">
              <Download className="mr-2 h-4 w-4" />
              Backups
            </TabsTrigger>
          </TabsList>

          {/* Tab: Crear Usuario */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Crear Usuario Manualmente</CardTitle>
                <CardDescription>
                  Cree usuarios con cualquier rol directamente desde este panel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Contraseña *</Label>
                      <Input
                        id="password"
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Nombre *</Label>
                      <Input
                        id="firstName"
                        value={newUser.firstName}
                        onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Apellido *</Label>
                      <Input
                        id="lastName"
                        value={newUser.lastName}
                        onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        value={newUser.phone}
                        onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Rol *</Label>
                      <Select
                        value={newUser.role}
                        onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SUPERADMIN">SUPERADMIN</SelectItem>
                          <SelectItem value="ADMIN">ADMIN</SelectItem>
                          <SelectItem value="MANAGER">MANAGER</SelectItem>
                          <SelectItem value="PROFESSIONAL">PROFESSIONAL</SelectItem>
                          <SelectItem value="RECEPTIONIST">RECEPTIONIST</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Crear Usuario
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Base de Datos */}
          <TabsContent value="database">
            <Card>
              <CardHeader>
                <CardTitle>Operaciones de Base de Datos</CardTitle>
                <CardDescription>
                  Resetear completamente la base de datos (elimina todos los datos)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="border-red-500/50 bg-red-500/10">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-red-400">
                    <strong>PELIGRO:</strong> Esta operación eliminará TODOS los datos de la base de datos de forma permanente.
                    Asegúrese de hacer un backup antes de continuar.
                  </AlertDescription>
                </Alert>
                <Button
                  variant="destructive"
                  onClick={handleResetDatabase}
                  disabled={isLoading}
                  className="w-full md:w-auto"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Reseteando...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      Resetear Base de Datos
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Backups */}
          <TabsContent value="backups" className="space-y-4">
            {/* Crear Backup */}
            <Card>
              <CardHeader>
                <CardTitle>Crear Backup</CardTitle>
                <CardDescription>
                  Genere un backup completo de la base de datos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleBackupDatabase} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando backup...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Crear Backup Ahora
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Restaurar Backup */}
            <Card>
              <CardHeader>
                <CardTitle>Restaurar Backup</CardTitle>
                <CardDescription>
                  Restaure la base de datos desde un backup anterior
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="backup-select">Seleccionar Backup</Label>
                  <Select value={selectedBackup} onValueChange={setSelectedBackup} disabled={isLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un backup" />
                    </SelectTrigger>
                    <SelectContent>
                      {backups.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No hay backups disponibles
                        </SelectItem>
                      ) : (
                        backups.map((backup) => (
                          <SelectItem key={backup.filename} value={backup.filename}>
                            {backup.filename} ({backup.size}) - {backup.date}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <Alert className="border-yellow-500/50 bg-yellow-500/10">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <AlertDescription className="text-yellow-500">
                    Restaurar un backup reemplazará todos los datos actuales con los del backup seleccionado.
                  </AlertDescription>
                </Alert>
                <Button
                  variant="secondary"
                  onClick={handleRestoreDatabase}
                  disabled={isLoading || !selectedBackup}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Restaurando...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Restaurar Backup
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Lista de Backups */}
            {backups.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Backups Disponibles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {backups.map((backup) => (
                      <div
                        key={backup.filename}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{backup.filename}</p>
                          <p className="text-sm text-muted-foreground">{backup.date}</p>
                        </div>
                        <div className="text-sm text-muted-foreground">{backup.size}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
