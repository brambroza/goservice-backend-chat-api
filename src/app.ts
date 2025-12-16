import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import { loadConfig } from './config/env';
import { createLogger } from './config/logger';
import { registerRoutes } from './routes';

export function createApp() {
  const config = loadConfig();
  const logger = createLogger(config);

  const app = express();

  app.use(
    bodyParser.json({
      verify: (req, _res, buf) => {
        (req as any).rawBody = buf.toString();
      },
    }),
  );
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(helmet());
  app.use(
    morgan('combined', {
      stream: {
        write: (msg) => logger.info(msg.trim()),
      },
    }),
  );

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  registerRoutes(app, config, logger);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logger.error({ err }, 'Unhandled error');
    res.status(500).json({ success: false, message: 'Internal server error' });
  });

  return { app, config, logger };
}
