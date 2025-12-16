import { Express, Router } from 'express';
import { AppConfig } from '../config/env';
import { Logger } from 'pino';
import {
  verifyFacebookSignature,
  verifyLineSignature,
  verifyThirdPartySignature,
} from '../middleware/signature';
import { LineService } from '../services/line.service';
import { FacebookService } from '../services/facebook.service';
import { ThirdPartyService } from '../services/thirdparty.service';
import { WebhookController } from '../controllers/webhook.controller';
import { LineClient } from '../clients/line-client';
import { FacebookClient } from '../clients/facebook-client';
import { KafkaClient } from '../clients/kafka-client';
import { RabbitMQClient } from '../clients/rabbitmq-client';
import { RedisClient } from '../clients/redis-client';
import { MlClient } from '../clients/ml-client';
import { NestClient } from '../clients/nest-client';

export function registerRoutes(app: Express, config: AppConfig, logger: Logger) {
  const router = Router();

  const lineClient = new LineClient(config.lineChannelAccessToken);
  const fbClient = new FacebookClient(config.fbPageAccessToken);
  const kafkaClient = new KafkaClient(config);
  const rabbitClient = new RabbitMQClient(config);
  const redisClient = new RedisClient(config);
  const mlClient = new MlClient(config);
  const nestClient = new NestClient(config);
  const controller = new WebhookController(
    new LineService(lineClient, logger, kafkaClient, rabbitClient, redisClient, mlClient, nestClient),
    new FacebookService(fbClient, logger, kafkaClient, rabbitClient, redisClient),
    new ThirdPartyService(logger, kafkaClient, rabbitClient, redisClient),
  );

  router.post('/webhooks/line', verifyLineSignature(config.lineChannelSecret), controller.lineWebhook);
  router.get('/webhooks/facebook', controller.fbVerify);
  router.post('/webhooks/facebook', verifyFacebookSignature(config.fbAppSecret), controller.fbWebhook);
  router.post(
    '/webhooks/thirdparty',
    verifyThirdPartySignature(config.thirdPartyWebhookSecret),
    controller.thirdPartyWebhook,
  );

  app.use('/', router);
}
