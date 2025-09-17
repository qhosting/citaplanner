
import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      firstName: string
      lastName: string
      role: string
      tenantId: string
      branchId?: string | undefined
      clientId?: string | undefined
      tenant?: any
      branch?: any
      client?: any
      tenantName?: string
    }
  }

  interface User {
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
    tenantId: string
    branchId?: string | undefined
    clientId?: string | null
    tenant?: any
    branch?: any
    client?: any
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string
    tenantId?: string
    branchId?: string
    clientId?: string
    tenant?: any
    branch?: any
    client?: any
    firstName?: string
    lastName?: string
  }
}
