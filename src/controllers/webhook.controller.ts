import { Request, Response } from 'express';
import { FacebookService } from '../services/facebook.service';
import { LineService } from '../services/line.service';
import { ThirdPartyService } from '../services/thirdparty.service';

export class WebhookController {
  constructor(
    private readonly lineService: LineService,
    private readonly fbService: FacebookService,
    private readonly thirdPartyService: ThirdPartyService,
  ) {}

  lineWebhook = async (req: Request, res: Response) => {
    const result = await this.lineService.handleWebhook(req.body);
    res.json({ success: true, data: result });
  };

  fbVerify = (req: Request, res: Response) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if (mode === 'subscribe' && token === process.env.FB_VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.status(403).send('Forbidden');
  };

  fbWebhook = async (req: Request, res: Response) => {
    const result = await this.fbService.handleWebhook(req.body);
    res.json({ success: true, data: result });
  };

  thirdPartyWebhook = async (req: Request, res: Response) => {
    const result = await this.thirdPartyService.handleWebhook(req.body);
    res.json({ success: true, data: result });
  };
}
