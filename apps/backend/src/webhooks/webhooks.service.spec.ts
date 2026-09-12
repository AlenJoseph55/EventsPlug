jest.mock('@nestjs/bullmq', () => {
  const { Inject } = jest.requireActual('@nestjs/common');
  return {
    InjectQueue: (name: string) => Inject(`BullQueue_${name}`),
    getQueueToken: (name: string) => `BullQueue_${name}`,
  };
});

import { Test, TestingModule } from '@nestjs/testing';
import { WebhooksService } from './webhooks.service';
import { PrismaService } from '../prisma.service';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { QUEUE_WEBHOOK_DELIVERY } from '../jobs/jobs.constants';

describe('WebhooksService', () => {
  let service: WebhooksService;
  let prisma: PrismaService;

  const mockPrisma = {
    webhookEndpoint: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockQueue = {
    add: jest.fn().mockResolvedValue({}),
    addBulk: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhooksService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: `BullQueue_${QUEUE_WEBHOOK_DELIVERY}`,
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<WebhooksService>(WebhooksService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('createEndpoint', () => {
    it('should reject invalid URL format', async () => {
      await expect(
        service.createEndpoint('org-1', 'not-a-valid-url'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject non-HTTPS URLs in production', async () => {
      const origEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      try {
        await expect(
          service.createEndpoint('org-1', 'http://example.com/webhook'),
        ).rejects.toThrow('Webhook URL must use HTTPS');
      } finally {
        process.env.NODE_ENV = origEnv;
      }
    });

    it('should block private IP ranges and cloud metadata endpoints', async () => {
      await expect(
        service.createEndpoint('org-1', 'https://169.254.169.254/latest/meta-data'),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.createEndpoint('org-1', 'https://metadata.google.internal/computeMetadata/v1/'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create endpoint with generated whsec_ signing secret and return it once', async () => {
      mockPrisma.webhookEndpoint.create.mockImplementation(({ data }) => ({
        id: 'ep-1',
        url: data.url,
        name: data.name,
        signingSecret: data.signingSecret,
        createdAt: new Date(),
      }));

      const result = await service.createEndpoint(
        'org-1',
        'https://events.myservice.com/webhook',
        'Production Webhook',
      );

      expect(result.url).toBe('https://events.myservice.com/webhook');
      expect(result.name).toBe('Production Webhook');
      expect(result.signingSecret).toMatch(/^whsec_[0-9a-f]{48}$/);
      expect(mockPrisma.webhookEndpoint.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          organizationId: 'org-1',
          url: 'https://events.myservice.com/webhook',
          name: 'Production Webhook',
          signingSecret: result.signingSecret,
        }),
      });
    });
  });

  describe('deleteEndpoint', () => {
    it('should throw NotFoundException if endpoint does not exist', async () => {
      mockPrisma.webhookEndpoint.findUnique.mockResolvedValue(null);

      await expect(
        service.deleteEndpoint('nonexistent', 'org-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if endpoint belongs to another org', async () => {
      mockPrisma.webhookEndpoint.findUnique.mockResolvedValue({
        id: 'ep-1',
        organizationId: 'other-org',
      });

      await expect(service.deleteEndpoint('ep-1', 'org-1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should soft-delete endpoint by setting revokedAt', async () => {
      mockPrisma.webhookEndpoint.findUnique.mockResolvedValue({
        id: 'ep-1',
        organizationId: 'org-1',
      });
      mockPrisma.webhookEndpoint.update.mockResolvedValue({ id: 'ep-1' });

      await service.deleteEndpoint('ep-1', 'org-1');

      expect(mockPrisma.webhookEndpoint.update).toHaveBeenCalledWith({
        where: { id: 'ep-1' },
        data: expect.objectContaining({ revokedAt: expect.any(Date) }),
        select: expect.any(Object),
      });
    });
  });

  describe('emit', () => {
    it('should query active org endpoints and enqueue one job per endpoint with retry config', async () => {
      mockPrisma.webhookEndpoint.findMany.mockResolvedValue([
        { id: 'ep-1', url: 'https://hook1.com', signingSecret: 'whsec_secret1' },
        { id: 'ep-2', url: 'https://hook2.com', signingSecret: 'whsec_secret2' },
      ]);

      await service.emit('org-1', 'registration.created', {
        registration: { id: 'reg-1' },
      });

      expect(mockPrisma.webhookEndpoint.findMany).toHaveBeenCalledWith({
        where: { organizationId: 'org-1', revokedAt: null },
      });

      expect(mockQueue.addBulk).toHaveBeenCalledTimes(1);
      expect(mockQueue.addBulk).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'registration.created',
            data: expect.objectContaining({
              endpointId: 'ep-1',
              url: 'https://hook1.com',
              signingSecret: 'whsec_secret1',
              envelope: expect.objectContaining({
                type: 'registration.created',
                data: { registration: { id: 'reg-1' } },
              }),
            }),
            opts: expect.objectContaining({
              attempts: 5,
              backoff: expect.objectContaining({ type: 'exponential', delay: 30000 }),
              removeOnComplete: true,
              removeOnFail: { count: 100 },
            }),
          }),
        ]),
      );
    });
  });
});
