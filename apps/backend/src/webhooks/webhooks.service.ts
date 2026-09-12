import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma.service';
import { QUEUE_WEBHOOK_DELIVERY } from '../jobs/jobs.constants';
import * as crypto from 'crypto';

@Injectable()
export class WebhooksService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(QUEUE_WEBHOOK_DELIVERY)
    private readonly webhookQueue: Queue,
  ) {}

  private validateWebhookUrl(rawUrl: string) {
    let parsed: URL;
    try {
      parsed = new URL(rawUrl);
    } catch {
      throw new BadRequestException('Invalid webhook URL format');
    }

    const isLocalDev = process.env.NODE_ENV !== 'production';
    if (parsed.protocol !== 'https:') {
      if (!isLocalDev || (parsed.hostname !== 'localhost' && parsed.hostname !== '127.0.0.1')) {
        throw new BadRequestException('Webhook URL must use HTTPS');
      }
    }

    // Block cloud metadata & loopback SSRF in production
    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === '169.254.169.254' ||
      hostname === 'metadata.google.internal' ||
      (process.env.NODE_ENV === 'production' &&
        (hostname === 'localhost' ||
          hostname === '127.0.0.1' ||
          hostname.startsWith('10.') ||
          hostname.startsWith('192.168.')))
    ) {
      throw new BadRequestException('Private or metadata IP addresses are not permitted');
    }
  }

  async createEndpoint(organizationId: string, url: string, name?: string) {
    this.validateWebhookUrl(url);

    const signingSecret = `whsec_${crypto.randomBytes(24).toString('hex')}`;

    const endpoint = await this.prisma.webhookEndpoint.create({
      data: {
        organizationId,
        url,
        name: name?.trim() || null,
        signingSecret,
      },
    });

    return {
      id: endpoint.id,
      name: endpoint.name,
      url: endpoint.url,
      signingSecret, // Returned once upon creation
      createdAt: endpoint.createdAt,
    };
  }

  async listEndpoints(organizationId: string) {
    return this.prisma.webhookEndpoint.findMany({
      where: {
        organizationId,
        revokedAt: null,
      },
      select: {
        id: true,
        name: true,
        url: true,
        lastFailedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteEndpoint(id: string, organizationId: string) {
    const endpoint = await this.prisma.webhookEndpoint.findUnique({
      where: { id },
    });

    if (!endpoint) {
      throw new NotFoundException('Webhook endpoint not found');
    }

    if (endpoint.organizationId !== organizationId) {
      throw new ForbiddenException('You do not own this webhook endpoint');
    }

    return this.prisma.webhookEndpoint.update({
      where: { id },
      data: { revokedAt: new Date() },
      select: {
        id: true,
        url: true,
        revokedAt: true,
      },
    });
  }

  async emit(organizationId: string, eventType: string, data: Record<string, any>) {
    const endpoints = await this.prisma.webhookEndpoint.findMany({
      where: {
        organizationId,
        revokedAt: null,
      },
    });

    if (!endpoints.length) {
      return;
    }

    const deliveryId = `wh_${crypto.randomUUID()}`;
    const timestamp = new Date().toISOString();

    const envelope = {
      id: deliveryId,
      type: eventType,
      createdAt: timestamp,
      data,
    };

    const jobs = endpoints.map((ep) => ({
      name: eventType,
      data: {
        endpointId: ep.id,
        url: ep.url,
        signingSecret: ep.signingSecret,
        envelope,
      },
      opts: {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 30000, // 30s, 60s, 120s, 240s, 480s
        },
        removeOnComplete: true,
        removeOnFail: { count: 100 },
      },
    }));

    await this.webhookQueue.addBulk(jobs);
  }
}
