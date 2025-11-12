/**
 * WebSocket Server for Real-Time Notifications
 * 
 * Gestiona conexiones WebSocket y broadcasting de eventos en tiempo real
 */

import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

export interface SocketData {
  userId: string;
  tenantId: string;
  role: string;
  email: string;
}

export interface NotificationEvent {
  id: string;
  type: string;
  message: string;
  data?: any;
  userId?: string;
  tenantId: string;
  createdAt: Date;
}

let io: SocketIOServer | null = null;

export function initSocketServer(server: HTTPServer) {
  if (io) {
    console.log('✅ Socket.io server already initialized');
    return io;
  }

  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    path: '/api/socket',
    addTrailingSlash: false,
  });

  // Middleware de autenticación
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      // Verificar token JWT
      const decoded = await getToken({
        req: {
          headers: {
            authorization: `Bearer ${token}`,
          },
        } as any,
        secret: process.env.NEXTAUTH_SECRET,
      });

      if (!decoded) {
        return next(new Error('Invalid token'));
      }

      // Obtener datos completos del usuario
      const user = await prisma.user.findUnique({
        where: { id: decoded.sub as string },
        select: {
          id: true,
          email: true,
          tenantId: true,
          role: true,
          firstName: true,
          lastName: true,
          isActive: true,
        },
      });

      if (!user || !user.isActive) {
        return next(new Error('User not found or inactive'));
      }

      // Almacenar datos del usuario en el socket
      socket.data = {
        userId: user.id,
        tenantId: user.tenantId,
        role: user.role,
        email: user.email,
      } as SocketData;

      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  // Eventos de conexión
  io.on('connection', (socket) => {
    const data = socket.data as SocketData;
    
    console.log(`✅ User connected: ${data.email} (${data.userId})`);

    // Unirse al room del tenant
    const tenantRoom = `tenant:${data.tenantId}`;
    socket.join(tenantRoom);

    // Unirse al room del usuario
    const userRoom = `user:${data.userId}`;
    socket.join(userRoom);

    // Unirse al room del rol
    const roleRoom = `role:${data.role}:${data.tenantId}`;
    socket.join(roleRoom);

    // Emitir evento de conexión exitosa
    socket.emit('connection:success', {
      userId: data.userId,
      tenantId: data.tenantId,
      role: data.role,
      timestamp: new Date(),
    });

    // Notificar a otros usuarios del mismo tenant que este usuario está online
    socket.to(tenantRoom).emit('user:online', {
      userId: data.userId,
      email: data.email,
      timestamp: new Date(),
    });

    // Evento: Marcar notificación como leída
    socket.on('notification:read', async (notificationId: string) => {
      try {
        await prisma.notificationLog.update({
          where: { id: notificationId, userId: data.userId },
          data: { readAt: new Date() },
        });

        socket.emit('notification:read:success', { notificationId });
      } catch (error) {
        console.error('Error marking notification as read:', error);
        socket.emit('notification:read:error', { notificationId, error: 'Failed to mark as read' });
      }
    });

    // Evento: Marcar todas las notificaciones como leídas
    socket.on('notification:read:all', async () => {
      try {
        await prisma.notificationLog.updateMany({
          where: {
            userId: data.userId,
            tenantId: data.tenantId,
            readAt: null,
          },
          data: { readAt: new Date() },
        });

        socket.emit('notification:read:all:success');
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
        socket.emit('notification:read:all:error', { error: 'Failed to mark all as read' });
      }
    });

    // Evento: Usuario está viendo una fecha específica del calendario
    socket.on('calendar:viewing', (data: { date: string; viewType: string }) => {
      const tenantRoom = `tenant:${socket.data.tenantId}`;
      socket.to(tenantRoom).emit('user:viewing:calendar', {
        userId: socket.data.userId,
        date: data.date,
        viewType: data.viewType,
      });
    });

    // Evento: Usuario está editando una cita
    socket.on('appointment:editing', (appointmentId: string) => {
      const tenantRoom = `tenant:${socket.data.tenantId}`;
      socket.to(tenantRoom).emit('appointment:editing:started', {
        userId: socket.data.userId,
        appointmentId,
      });
    });

    // Evento: Usuario dejó de editar una cita
    socket.on('appointment:editing:stop', (appointmentId: string) => {
      const tenantRoom = `tenant:${socket.data.tenantId}`;
      socket.to(tenantRoom).emit('appointment:editing:stopped', {
        userId: socket.data.userId,
        appointmentId,
      });
    });

    // Evento: Actualizar presencia
    socket.on('presence:update', (status: 'online' | 'away') => {
      const tenantRoom = `tenant:${socket.data.tenantId}`;
      socket.to(tenantRoom).emit('user:presence', {
        userId: socket.data.userId,
        status,
        timestamp: new Date(),
      });
    });

    // Desconexión
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${data.email} (${data.userId})`);
      
      // Notificar a otros usuarios
      socket.to(tenantRoom).emit('user:offline', {
        userId: data.userId,
        timestamp: new Date(),
      });
    });
  });

  console.log('🚀 Socket.io server initialized');
  return io;
}

export function getSocketServer(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.io server not initialized. Call initSocketServer first.');
  }
  return io;
}

// Función auxiliar para emitir eventos a un tenant específico
export function emitToTenant(tenantId: string, event: string, data: any) {
  if (!io) {
    console.warn('Socket.io server not initialized');
    return;
  }

  io.to(`tenant:${tenantId}`).emit(event, data);
}

// Función auxiliar para emitir eventos a un usuario específico
export function emitToUser(userId: string, event: string, data: any) {
  if (!io) {
    console.warn('Socket.io server not initialized');
    return;
  }

  io.to(`user:${userId}`).emit(event, data);
}

// Función auxiliar para emitir eventos a un rol específico en un tenant
export function emitToRole(role: string, tenantId: string, event: string, data: any) {
  if (!io) {
    console.warn('Socket.io server not initialized');
    return;
  }

  io.to(`role:${role}:${tenantId}`).emit(event, data);
}

// Función auxiliar para obtener usuarios conectados de un tenant
export function getConnectedUsers(tenantId: string): number {
  if (!io) {
    return 0;
  }

  const room = io.sockets.adapter.rooms.get(`tenant:${tenantId}`);
  return room ? room.size : 0;
}

// Función auxiliar para obtener información de todos los sockets conectados
export async function getConnectionStats() {
  if (!io) {
    return {
      totalConnections: 0,
      tenants: {},
    };
  }

  const sockets = await io.fetchSockets();
  const stats: {
    totalConnections: number;
    tenants: Record<string, { users: string[]; count: number }>;
  } = {
    totalConnections: sockets.length,
    tenants: {},
  };

  sockets.forEach((socket) => {
    const data = socket.data as SocketData;
    if (!stats.tenants[data.tenantId]) {
      stats.tenants[data.tenantId] = {
        users: [],
        count: 0,
      };
    }
    stats.tenants[data.tenantId].users.push(data.userId);
    stats.tenants[data.tenantId].count++;
  });

  return stats;
}

export default io;
