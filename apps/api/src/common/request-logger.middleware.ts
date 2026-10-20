import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

const REQUEST_ID_PATTERN = /^[A-Za-z0-9-]{8,64}$/;

export function resolveRequestId(header: string | string[] | undefined) {
  const value = Array.isArray(header) ? header[0] : header;
  return value && REQUEST_ID_PATTERN.test(value) ? value : randomUUID();
}

export function redactPath(url: string) {
  return url.split('?')[0];
}

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction) {
    const startedAt = process.hrtime.bigint();
    const requestId = resolveRequestId(request.headers['x-request-id']);
    response.setHeader('x-request-id', requestId);

    response.on('finish', () => {
      const durationMs =
        Number(process.hrtime.bigint() - startedAt) / 1_000_000;
      this.logger.log(
        JSON.stringify({
          requestId,
          method: request.method,
          path: redactPath(request.originalUrl),
          status: response.statusCode,
          durationMs: Math.round(durationMs),
        }),
      );
    });
    next();
  }
}
