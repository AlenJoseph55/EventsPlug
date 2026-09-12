jest.mock('@eventflow/templates', () => ({
  FORM_TEMPLATES: {},
}));

jest.mock('@eventflow/types', () => ({
  OrganizationStatus: {
    ACTIVE: 'ACTIVE',
    SUSPENDED: 'SUSPENDED',
  },
}));

jest.mock('@nestjs/bullmq', () => ({
  InjectQueue: () => () => {},
}));

import { Test, TestingModule } from '@nestjs/testing';
import { EventsService, CreateEventDto } from './events.service';
import { PrismaService } from '../prisma.service';
import { WebhooksService } from '../webhooks/webhooks.service';
import { BadRequestException } from '@nestjs/common';
import { EventStatus } from '@prisma/client';

describe('EventsService - Featured Limit Validation', () => {
  let service: EventsService;
  let prisma: PrismaService;

  const mockPrisma = {
    event: {
      count: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: WebhooksService,
          useValue: { emit: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should throw BadRequestException if creating a featured event and organization already has 3 active featured events', async () => {
      mockPrisma.event.findUnique.mockResolvedValue(null); // No collision on slug
      mockPrisma.event.count.mockResolvedValue(3); // Already 3 active featured events

      const dto: CreateEventDto = {
        title: 'New Featured Event',
        description: 'Description',
        date: new Date().toISOString(),
        location: 'Virtual',
        isFeatured: true,
      };

      await expect(service.create('org-id-123', dto)).rejects.toThrow(
        new BadRequestException(
          'An organization can have at most 3 featured events. Please unfeature another event first.',
        ),
      );

      expect(mockPrisma.event.count).toHaveBeenCalledWith({
        where: {
          organizationId: 'org-id-123',
          isFeatured: true,
          status: EventStatus.ACTIVE,
        },
      });
      expect(mockPrisma.event.create).not.toHaveBeenCalled();
    });

    it('should successfully create event if featured is true but active count is less than 3', async () => {
      mockPrisma.event.findUnique.mockResolvedValue(null);
      mockPrisma.event.count.mockResolvedValue(1);
      mockPrisma.event.create.mockResolvedValue({ id: 'event-new' });

      const dto: CreateEventDto = {
        title: 'New Featured Event 2',
        description: 'Description',
        date: new Date().toISOString(),
        location: 'Virtual',
        isFeatured: true,
      };

      const result = await service.create('org-id-123', dto);

      expect(result).toEqual({ id: 'event-new' });
      expect(mockPrisma.event.count).toHaveBeenCalledWith({
        where: {
          organizationId: 'org-id-123',
          isFeatured: true,
          status: EventStatus.ACTIVE,
        },
      });
      expect(mockPrisma.event.create).toHaveBeenCalled();
    });

    it('should not perform count check if event is not featured', async () => {
      mockPrisma.event.findUnique.mockResolvedValue(null);
      mockPrisma.event.create.mockResolvedValue({ id: 'event-new-unfeatured' });

      const dto: CreateEventDto = {
        title: 'Regular Event',
        description: 'Description',
        date: new Date().toISOString(),
        location: 'Virtual',
        isFeatured: false,
      };

      const result = await service.create('org-id-123', dto);

      expect(result).toEqual({ id: 'event-new-unfeatured' });
      expect(mockPrisma.event.count).not.toHaveBeenCalled();
      expect(mockPrisma.event.create).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should throw BadRequestException if updating event to active featured and organization already has 3 active featured events', async () => {
      const existingEvent = {
        id: 'event-1',
        organizationId: 'org-id-123',
        status: EventStatus.DRAFT,
        isFeatured: false,
        title: 'Draft Event',
      };

      mockPrisma.event.findFirst.mockResolvedValue(existingEvent);
      mockPrisma.event.count.mockResolvedValue(3); // Already 3 other active featured events

      const dto = {
        status: EventStatus.ACTIVE,
        isFeatured: true,
      };

      await expect(
        service.update('event-1', 'org-id-123', dto),
      ).rejects.toThrow(
        new BadRequestException(
          'An organization can have at most 3 featured events. Please unfeature another event first.',
        ),
      );

      expect(mockPrisma.event.count).toHaveBeenCalledWith({
        where: {
          organizationId: 'org-id-123',
          isFeatured: true,
          status: EventStatus.ACTIVE,
          NOT: { id: 'event-1' },
        },
      });
      expect(mockPrisma.event.update).not.toHaveBeenCalled();
    });

    it('should successfully update event if active featured count limit of 3 is not exceeded', async () => {
      const existingEvent = {
        id: 'event-1',
        organizationId: 'org-id-123',
        status: EventStatus.DRAFT,
        isFeatured: false,
        title: 'Draft Event',
      };

      mockPrisma.event.findFirst.mockResolvedValue(existingEvent);
      mockPrisma.event.count.mockResolvedValue(2);
      mockPrisma.event.update.mockResolvedValue({
        id: 'event-1',
        status: EventStatus.ACTIVE,
        isFeatured: true,
      });

      const dto = {
        status: EventStatus.ACTIVE,
        isFeatured: true,
      };

      const result = await service.update('event-1', 'org-id-123', dto);

      expect(result).toEqual({
        id: 'event-1',
        status: EventStatus.ACTIVE,
        isFeatured: true,
      });
      expect(mockPrisma.event.count).toHaveBeenCalledWith({
        where: {
          organizationId: 'org-id-123',
          isFeatured: true,
          status: EventStatus.ACTIVE,
          NOT: { id: 'event-1' },
        },
      });
      expect(mockPrisma.event.update).toHaveBeenCalled();
    });
  });
});
