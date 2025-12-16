import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

export function verifyLineSignature(channelSecret: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const signature = req.header('x-line-signature');
    const rawBody = (req as any).rawBody as string | undefined;
    if (!signature || !rawBody) {
      return res.status(400).json({ success: false, message: 'Missing signature/body' });
    }
    const expected = crypto.createHmac('sha256', channelSecret).update(rawBody).digest('base64');
    if (expected !== signature) {
      return res.status(401).json({ success: false, message: 'Invalid LINE signature' });
    }
    return next();
  };
}

export function verifyFacebookSignature(appSecret: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const signature = req.header('x-hub-signature-256');
    const rawBody = (req as any).rawBody as string | undefined;
    if (!signature || !rawBody) {
      return res.status(400).json({ success: false, message: 'Missing signature/body' });
    }
    const expected = 'sha256=' + crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex');
    if (expected !== signature) {
      return res.status(401).json({ success: false, message: 'Invalid FB signature' });
    }
    return next();
  };
}

export function verifyThirdPartySignature(secret: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const signature = req.header('x-webhook-signature');
    const rawBody = (req as any).rawBody as string | undefined;
    if (!signature || !rawBody) {
      return res.status(400).json({ success: false, message: 'Missing signature/body' });
    }
    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    if (expected !== signature) {
      return res.status(401).json({ success: false, message: 'Invalid webhook signature' });
    }
    return next();
  };
}
