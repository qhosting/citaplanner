
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { prisma } from './db'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email y contraseña son requeridos')
        }

        // Primero buscar en usuarios del sistema (staff, admin, superadmin)
        let user = await prisma.user.findUnique({
          where: { 
            email: credentials.email 
          },
          include: {
            tenant: true,
            branch: true
          }
        })

        // Si no encontramos usuario del sistema, buscar en usuarios cliente
        let clientUser = null
        if (!user) {
          clientUser = await prisma.clientUser.findUnique({
            where: { 
              email: credentials.email 
            },
            include: {
              tenant: true,
              client: true
            }
          })
        }

        const targetUser = user || clientUser
        if (!targetUser || !targetUser.password) {
          throw new Error('Credenciales inválidas')
        }

        const isValidPassword = await bcrypt.compare(credentials.password, targetUser.password)

        if (!isValidPassword) {
          throw new Error('Credenciales inválidas')
        }

        if (!targetUser.isActive) {
          throw new Error('Usuario inactivo')
        }

        // Returnamos datos apropiados según el tipo de usuario
        if (clientUser) {
          return {
            id: clientUser.id,
            email: clientUser.email,
            firstName: clientUser.firstName,
            lastName: clientUser.lastName,
            role: 'CLIENT',
            tenantId: clientUser.tenantId,
            branchId: undefined,
            tenant: clientUser.tenant,
            branch: null,
            clientId: clientUser.clientId,
            client: clientUser.client
          }
        } else {
          return {
            id: user!.id,
            email: user!.email,
            firstName: user!.firstName,
            lastName: user!.lastName,
            role: user!.role,
            tenantId: user!.tenantId,
            branchId: user!.branchId || undefined,
            tenant: user!.tenant,
            branch: user!.branch,
            clientId: null,
            client: null
          }
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.tenantId = user.tenantId
        token.branchId = user.branchId
        token.tenant = user.tenant
        token.branch = user.branch
        token.clientId = user.clientId || undefined
        token.client = user.client
        token.firstName = user.firstName
        token.lastName = user.lastName
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.tenantId = token.tenantId as string
        session.user.branchId = token.branchId as string
        session.user.tenant = token.tenant as any
        session.user.branch = token.branch as any
        session.user.clientId = token.clientId as string | undefined
        session.user.client = token.client as any
        session.user.firstName = token.firstName as string
        session.user.lastName = token.lastName as string
        session.user.tenantName = token.tenant?.name as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  secret: process.env.NEXTAUTH_SECRET
}
