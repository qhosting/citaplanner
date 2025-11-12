/**
 * useSocket Hook
 * 
 * Hook personalizado para gestionar la conexión WebSocket con Socket.io
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';

export interface SocketContext {
  socket: Socket | null;
  isConnected: boolean;
  on: (event: string, handler: Function) => void;
  off: (event: string, handler: Function) => void;
  emit: (event: string, data?: any) => void;
}

export function useSocket(): SocketContext {
  const { data: session, status } = useSession();
  const socketRef = useRef<Socket | null>(null);
  const isConnected = useRef(false);

  useEffect(() => {
    if (status !== 'authenticated' || !session) {
      return;
    }

    // Inicializar socket solo una vez
    if (!socketRef.current) {
      const socket = io({
        path: '/api/socket',
        addTrailingSlash: false,
        auth: {
          token: session.accessToken || '',
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      socket.on('connect', () => {
        console.log('✅ WebSocket connected');
        isConnected.current = true;
      });

      socket.on('connection:success', (data) => {
        console.log('✅ Authentication successful:', data);
      });

      socket.on('disconnect', () => {
        console.log('❌ WebSocket disconnected');
        isConnected.current = false;
      });

      socket.on('connect_error', (error) => {
        console.error('❌ WebSocket connection error:', error);
        isConnected.current = false;
      });

      socketRef.current = socket;
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        isConnected.current = false;
      }
    };
  }, [session, status]);

  const on = useCallback((event: string, handler: Function) => {
    if (socketRef.current) {
      socketRef.current.on(event, handler as any);
    }
  }, []);

  const off = useCallback((event: string, handler: Function) => {
    if (socketRef.current) {
      socketRef.current.off(event, handler as any);
    }
  }, []);

  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current && isConnected.current) {
      socketRef.current.emit(event, data);
    }
  }, []);

  return {
    socket: socketRef.current,
    isConnected: isConnected.current,
    on,
    off,
    emit,
  };
}
