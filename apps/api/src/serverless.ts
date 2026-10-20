import type { IncomingMessage, ServerResponse } from 'node:http';
import { createApp } from './app.factory';

type RequestListener = (req: IncomingMessage, res: ServerResponse) => void;

let listener: Promise<RequestListener> | undefined;

async function getListener(): Promise<RequestListener> {
  const app = await createApp();
  await app.init();
  return app.getHttpAdapter().getInstance() as RequestListener;
}

/**
 * Serverless entry (Vercel Functions). The Nest app is created once per
 * warm instance and reused across invocations.
 */
export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
) {
  listener ??= getListener().catch((error: unknown) => {
    listener = undefined;
    throw error;
  });
  const app = await listener;
  app(req, res);
}
