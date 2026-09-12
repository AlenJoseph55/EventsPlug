jest.mock('@eventflow/validators', () => ({
  validateForm: jest.fn(() => ({ success: true, errors: [] })),
}));

jest.mock('@eventflow/templates', () => ({
  FORM_TEMPLATES: {},
}));

jest.mock('@eventflow/types', () => ({
  OrganizationStatus: {
    ACTIVE: 'ACTIVE',
    SUSPENDED: 'SUSPENDED',
  },
}));

jest.mock('@nestjs/bullmq', () => {
  const { Inject } = jest.requireActual('@nestjs/common');
  return {
    InjectQueue: (name: string) => Inject(`BullQueue_${name}`),
    getQueueToken: (name: string) => `BullQueue_${name}`,
  };
});

import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationsService } from './registrations.service';
import { PrismaService } from '../prisma.service';
import { WebhooksService } from '../webhooks/webhooks.service';
import { EmailService } from '../email/email.service';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { RegistrationStatus, IdentityType } from '@prisma/client';

describe('RegistrationsService', () => {
  let service: RegistrationsService;
  let prisma: PrismaService;

  const mockPrisma = {
    event: {
      findUnique: jest.fn(),
    },
    registration: {
      create: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findFirst: jest.fn(),
    },
  };

  const mockWebhooks = {
    emit: jest.fn().mockResolvedValue(undefined),
  };

  const mockEmailService = {
    enqueueConfirmation: jest.fn().mockResolvedValue({}),
    enqueueOrganizerAlert: jest.fn().mockResolvedValue({}),
    enqueueCancellation: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: WebhooksService,
          useValue: mockWebhooks,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    service = module.get<RegistrationsService>(RegistrationsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should throw NotFoundException if event does not exist', async () => {
      mockPrisma.event.findUnique.mockResolvedValue(null);

      await expect(service.register('invalid-id', {})).rejects.toThrow(
        new NotFoundException('Event not found'),
      );
    });

    it('should reject registration if event status is CLOSED', async () => {
      mockPrisma.event.findUnique.mockResolvedValue({
        id: 'event-closed',
        status: 'CLOSED',
        formFields: [],
      });

      await expect(service.register('event-closed', {})).rejects.toThrow(
        new BadRequestException('Registration is closed for this event.'),
      );
      expect(mockPrisma.registration.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if event date is in the past and no deadline is set', async () => {
      const pastEvent = {
        id: 'event-past',
        slug: 'past-event-slug',
        title: 'Past Event',
        date: new Date(Date.now() - 100000).toISOString(),
        registrationDeadline: null,
        maxRegistrations: 100,
        formFields: [],
        _count: { registrations: 0 },
      };

      mockPrisma.event.findUnique.mockResolvedValue(pastEvent);

      await expect(service.register('event-past', {})).rejects.toThrow(
        new BadRequestException(
          'Registration is closed because the registration deadline has passed.',
        ),
      );

      expect(mockPrisma.registration.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if registrationDeadline is in the past even if event date is in the future', async () => {
      const deadlinePastEvent = {
        id: 'event-deadline-past',
        slug: 'deadline-past-event-slug',
        title: 'Future Event with Past Deadline',
        date: new Date(Date.now() + 1000000).toISOString(),
        registrationDeadline: new Date(Date.now() - 50000).toISOString(),
        maxRegistrations: 100,
        formFields: [],
        _count: { registrations: 0 },
      };

      mockPrisma.event.findUnique.mockResolvedValue(deadlinePastEvent);

      await expect(service.register('event-deadline-past', {})).rejects.toThrow(
        new BadRequestException(
          'Registration is closed because the registration deadline has passed.',
        ),
      );

      expect(mockPrisma.registration.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if event is fully booked', async () => {
      const fullEvent = {
        id: 'event-full',
        slug: 'full-event-slug',
        title: 'Full Event',
        date: new Date(Date.now() + 100000).toISOString(),
        maxRegistrations: 10,
        formFields: [],
        _count: { registrations: 10 },
      };

      mockPrisma.event.findUnique.mockResolvedValue(fullEvent);

      await expect(service.register('event-full', {})).rejects.toThrow(
        new BadRequestException(
          'This event is fully booked! Registration limits have been reached.',
        ),
      );

      expect(mockPrisma.registration.create).not.toHaveBeenCalled();
    });

    it('should extract and normalize identityValue from EMAIL identity field', async () => {
      const validEvent = {
        id: 'event-ok',
        slug: 'valid-event-slug',
        title: 'Valid Event',
        organizationId: 'org-1',
        date: new Date(Date.now() + 1000000).toISOString(),
        maxRegistrations: 10,
        formFields: [
          {
            id: 'field-email',
            type: 'EMAIL',
            label: 'Email',
            isIdentityField: true,
          },
        ],
        _count: { registrations: 2 },
      };

      mockPrisma.event.findUnique.mockResolvedValue(validEvent);
      mockPrisma.registration.create.mockResolvedValue({
        id: 'reg-1',
        status: RegistrationStatus.CONFIRMED,
        createdAt: new Date(),
      });

      await service.register('event-ok', {
        'field-email': '   Test.User@EXAMPLE.com   ',
      });

      expect(mockPrisma.registration.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            identityValue: 'test.user@example.com',
            identityType: IdentityType.EMAIL,
            status: RegistrationStatus.CONFIRMED,
          }),
        }),
      );
    });

    it('should catch Prisma P2002 duplicate unique constraint error and throw 409 ConflictException', async () => {
      const validEvent = {
        id: 'event-ok',
        slug: 'valid-event-slug',
        title: 'Valid Event',
        organizationId: 'org-1',
        date: new Date(Date.now() + 1000000).toISOString(),
        maxRegistrations: 10,
        formFields: [
          {
            id: 'field-email',
            type: 'EMAIL',
            label: 'Email',
            isIdentityField: true,
          },
        ],
        _count: { registrations: 2 },
      };

      mockPrisma.event.findUnique.mockResolvedValue(validEvent);
      const prismaError: any = new Error('Unique constraint failed on the fields: (`eventId`,`identityValue`)');
      prismaError.code = 'P2002';
      mockPrisma.registration.create.mockRejectedValue(prismaError);

      await expect(
        service.register('event-ok', { 'field-email': 'existing@example.com' }),
      ).rejects.toThrow(
        new ConflictException(
          'This email address is already registered for this event.',
        ),
      );
    });

    it('should successfully register a ticket and emit webhook & email side-effects', async () => {
      const validEvent = {
        id: 'event-ok',
        slug: 'valid-event-slug',
        title: 'Valid Event',
        organizationId: 'org-1',
        date: new Date(Date.now() + 1000000).toISOString(),
        location: 'Virtual',
        maxRegistrations: 10,
        formFields: [],
        _count: { registrations: 2 },
      };

      const mockRegistration = {
        id: 'REG-VALID-EVENT-SLUG-XXXXXX',
        eventId: 'event-ok',
        answers: { name: 'Alice' },
        status: RegistrationStatus.CONFIRMED,
        createdAt: new Date(),
      };

      mockPrisma.event.findUnique.mockResolvedValue(validEvent);
      mockPrisma.registration.create.mockResolvedValue(mockRegistration);
      mockPrisma.user.findFirst.mockResolvedValue({ email: 'admin@org.com' });

      const result = await service.register('event-ok', { name: 'Alice' });

      expect(result).toEqual(mockRegistration);
      expect(mockPrisma.registration.create).toHaveBeenCalled();
      expect(mockWebhooks.emit).toHaveBeenCalledWith(
        'org-1',
        'registration.created',
        expect.objectContaining({
          event: expect.objectContaining({ id: 'event-ok' }),
          registration: expect.objectContaining({ id: mockRegistration.id }),
        }),
      );
    });
  });

  describe('cancel', () => {
    it('should throw NotFoundException if registration does not exist', async () => {
      mockPrisma.registration.findUnique.mockResolvedValue(null);

      await expect(service.cancel('missing-reg')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if registration is already cancelled', async () => {
      mockPrisma.registration.findUnique.mockResolvedValue({
        id: 'reg-cancelled',
        status: RegistrationStatus.CANCELLED,
        event: { id: 'evt-1', organizationId: 'org-1', title: 'Test' },
      });

      await expect(service.cancel('reg-cancelled')).rejects.toThrow(
        ConflictException,
      );
    });

    it('should mark registration CANCELLED and emit registration.cancelled webhook', async () => {
      mockPrisma.registration.findUnique.mockResolvedValue({
        id: 'reg-active',
        status: RegistrationStatus.CONFIRMED,
        identityValue: 'attendee@example.com',
        event: { id: 'evt-1', organizationId: 'org-1', title: 'Test Event' },
      });

      mockPrisma.registration.update.mockResolvedValue({
        id: 'reg-active',
        status: RegistrationStatus.CANCELLED,
        updatedAt: new Date(),
      });

      const res = await service.cancel('reg-active');

      expect(res.status).toBe(RegistrationStatus.CANCELLED);
      expect(mockPrisma.registration.update).toHaveBeenCalledWith({
        where: { id: 'reg-active' },
        data: { status: RegistrationStatus.CANCELLED },
      });
      expect(mockWebhooks.emit).toHaveBeenCalledWith(
        'org-1',
        'registration.cancelled',
        expect.objectContaining({
          event: { id: 'evt-1' },
          registration: expect.objectContaining({
            id: 'reg-active',
            status: RegistrationStatus.CANCELLED,
          }),
        }),
      );
      expect(mockEmailService.enqueueCancellation).toHaveBeenCalledWith(
        'attendee@example.com',
        'Test Event',
        'reg-active',
      );
    });
  });
});
