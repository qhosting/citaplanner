/**
 * Custom Next.js Server with Socket.io Support
 * 
 * Este servidor personalizado permite integrar Socket.io con Next.js
 * para soporte de WebSocket en tiempo real.
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });

  // Inicializar Socket.io después de crear el servidor HTTP
  // Nota: La inicialización se hace de forma lazy cuando se necesite
  // para evitar problemas de importación circular
  server.once('listening', async () => {
    try {
      // Importar dinámicamente para evitar problemas con TypeScript/ESM
      const { initSocketServer } = await import('./lib/socket/server.js');
      initSocketServer(server);
      console.log('🚀 Socket.io server initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Socket.io server:', error);
    }
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Environment: ${dev ? 'development' : 'production'}`);
  });
}).catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
