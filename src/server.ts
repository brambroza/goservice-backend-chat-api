import { createServer } from 'http';
import { createApp } from './app';
import { createSocketServer } from './socket/socket-server';

const { app, config, logger } = createApp();
const httpServer = createServer(app);
createSocketServer(httpServer, logger);

httpServer.listen(config.port, () => {
  logger.info(`Chat API service listening on port ${config.port}`);
});
