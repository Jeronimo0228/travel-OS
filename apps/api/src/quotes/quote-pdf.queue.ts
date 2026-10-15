import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PdfStatus } from '@prisma/client';
import { Job, Queue, Worker } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { renderQuotePdf } from './quote-pdf.renderer';

const QUEUE_NAME = 'quote-pdf';

interface PdfJobData {
  agencyId: string;
  quoteId: string;
}

@Injectable()
export class QuotePdfQueue implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(QuotePdfQueue.name);
  private queue?: Queue<PdfJobData>;
  private worker?: Worker<PdfJobData>;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit() {
    const redisUrl = new URL(this.config.getOrThrow<string>('REDIS_URL'));
    if (redisUrl.protocol !== 'redis:' && redisUrl.protocol !== 'rediss:') {
      throw new Error('REDIS_URL must use the redis:// or rediss:// protocol');
    }

    const port = Number(redisUrl.port || 6379);
    const databaseIndex =
      redisUrl.pathname.length > 1
        ? Number(redisUrl.pathname.slice(1))
        : undefined;
    if (
      !Number.isInteger(port) ||
      port < 1 ||
      port > 65_535 ||
      (databaseIndex !== undefined &&
        (!Number.isInteger(databaseIndex) || databaseIndex < 0))
    ) {
      throw new Error('REDIS_URL contains an invalid port or database index');
    }

    const connection = {
      host: redisUrl.hostname,
      port,
      ...(redisUrl.username
        ? { username: decodeURIComponent(redisUrl.username) }
        : {}),
      ...(redisUrl.password
        ? { password: decodeURIComponent(redisUrl.password) }
        : {}),
      ...(databaseIndex !== undefined ? { db: databaseIndex } : {}),
      ...(redisUrl.protocol === 'rediss:' ? { tls: {} } : {}),
    };

    this.queue = new Queue<PdfJobData>(QUEUE_NAME, { connection });
    this.worker = new Worker<PdfJobData>(
      QUEUE_NAME,
      (job) => this.generate(job),
      { connection, concurrency: 2 },
    );
    this.worker.on('failed', (job, error) => {
      this.logger.error(
        `Quote PDF job ${job?.id ?? 'unknown'} failed: ${error.message}`,
      );
    });
    this.worker.on('error', (error) => {
      this.logger.error(`Quote PDF worker error: ${error.message}`);
    });
    this.queue.on('error', (error) => {
      this.logger.error(`Quote PDF queue error: ${error.message}`);
    });
  }

  async onModuleDestroy() {
    await Promise.all([this.worker?.close(), this.queue?.close()]);
  }

  async enqueue(agencyId: string, quoteId: string) {
    if (!this.queue) {
      throw new Error('Quote PDF queue has not been initialized');
    }

    await this.queue.add(
      'generate',
      { agencyId, quoteId },
      {
        jobId: `${agencyId}-${quoteId}`,
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: true,
        removeOnFail: true,
      },
    );
  }

  private async generate(job: Job<PdfJobData>) {
    const { agencyId, quoteId } = job.data;
    try {
      const quote = await this.prisma.quote.findFirst({
        where: { id: quoteId, agencyId },
        select: {
          prompt: true,
          destination: true,
          durationDays: true,
          travelerCount: true,
          options: {
            orderBy: { position: 'asc' },
            select: {
              title: true,
              summary: true,
              totalPrice: true,
              currency: true,
              items: {
                select: {
                  nameSnapshot: true,
                  pricingUnit: true,
                  quantity: true,
                  unitPrice: true,
                },
              },
            },
          },
        },
      });

      if (!quote) {
        throw new Error('Quote no longer exists in the requested agency');
      }

      const pdfData = await renderQuotePdf(quote);
      const databaseBytes = new Uint8Array(new ArrayBuffer(pdfData.byteLength));
      databaseBytes.set(pdfData);
      const update = await this.prisma.quote.updateMany({
        where: { id: quoteId, agencyId, pdfStatus: PdfStatus.PENDING },
        data: { pdfStatus: PdfStatus.READY, pdfData: databaseBytes },
      });
      if (update.count !== 1) {
        throw new Error('Quote PDF status changed before generation completed');
      }
    } catch (error) {
      if (job.attemptsMade + 1 >= (job.opts.attempts ?? 1)) {
        try {
          await this.prisma.quote.updateMany({
            where: {
              id: quoteId,
              agencyId,
              pdfStatus: PdfStatus.PENDING,
            },
            data: { pdfStatus: PdfStatus.FAILED },
          });
        } catch (statusError) {
          this.logger.error(
            `Could not mark quote ${quoteId} PDF as failed`,
            statusError instanceof Error ? statusError.stack : undefined,
          );
        }
      }

      throw error;
    }
  }
}
