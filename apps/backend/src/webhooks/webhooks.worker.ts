import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_WEBHOOK_DELIVERY } from '../jobs/jobs.constants';
import { PrismaService } from '../prisma.service';
import * as crypto from 'crypto';

interface WebhookJobData {
  endpointId: string;
  url: string;
  signingSecret: string;
  envelope: {
    id: string;
    type: string;
    createdAt: string;
    data: any;
  };
}

@Processor(QUEUE_WEBHOOK_DELIVERY)
export class WebhooksWorker extends WorkerHost {
  private readonly logger = new Logger(WebhooksWorker.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<WebhookJobData>): Promise<void> {
    const { endpointId, url, signingSecret, envelope } = job.data;
    const rawBody = JSON.stringify(envelope);

    const signature = crypto
      .createHmac('sha256', signingSecret)
      .update(rawBody)
      .digest('hex');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-EventsPlug-Event': envelope.type,
          'X-EventsPlug-Delivery': envelope.id,
          'X-EventsPlug-Signature': `sha256=${signature}`,
          'User-Agent': 'EventsPlug-Webhooks/1.0',
        },
        body: rawBody,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(
          `Webhook endpoint returned status code ${response.status}: ${response.statusText}`,
        );
      }

      this.logger.log(
        `Webhook delivered: ${envelope.type} [${envelope.id}] -> ${url}`,
      );
    } catch (err: any) {
      this.logger.warn(
        `Webhook delivery attempt ${job.attemptsMade + 1} failed for ${url}: ${err.message}`,
      );

      // If this was the last attempt, update lastFailedAt in DB
      if (job.attemptsMade + 1 >= (job.opts.attempts || 5)) {
        await this.prisma.webhookEndpoint
          .update({
            where: { id: endpointId },
            data: { lastFailedAt: new Date() },
          })
          .catch(() => {});
      }

      throw err; // Trigger BullMQ retry
    } finally {
      clearTimeout(timeout);
    }
  }
}
