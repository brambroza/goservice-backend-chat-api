import { createApp } from './app';

const { app, config, logger } = createApp();

app.listen(config.port, () => {
  logger.info(`Chat API service listening on port ${config.port}`);
});
