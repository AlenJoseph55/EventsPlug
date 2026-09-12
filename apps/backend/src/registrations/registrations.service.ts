import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as crypto from 'crypto';
import { validateForm } from '@eventflow/validators';
import { WebhooksService } from '../webhooks/webhooks.service';
import { EmailService } from '../email/email.service';
import { RegistrationStatus, IdentityType } from '@prisma/client';

@Injectable()
export class RegistrationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly webhooksService: WebhooksService,
    private readonly emailService: EmailService,
  ) {}

  async register(eventId: string, answers: Record<string, any>) {
    // 1. Fetch the event including its custom formFields and organization info
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        formFields: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.status === 'CLOSED') {
      throw new BadRequestException('Registration is closed for this event.');
    }

    if (event.status === 'DRAFT' || event.status === 'INACTIVE') {
      throw new BadRequestException(
        'This event is currently not accepting registrations.',
      );
    }

    // 2. Check registration deadline
    const now = new Date();
    const effectiveDeadline = event.registrationDeadline
      ? new Date(event.registrationDeadline)
      : event.date
        ? new Date(event.date)
        : null;

    if (effectiveDeadline && effectiveDeadline < now) {
      throw new BadRequestException(
        'Registration is closed because the registration deadline has passed.',
      );
    }

    // Dynamic custom validations using @eventflow/validators
    const validation = validateForm(answers, event.formFields, 'id');
    if (!validation.success) {
      throw new BadRequestException({
        message: 'Registration form validation failed.',
        errors: validation.errors,
      });
    }

    // 3. Count total active confirmed responses if capped
    if (event.maxRegistrations !== null) {
      const activeCount =
        (event as any)._count?.registrations !== undefined
          ? (event as any)._count.registrations
          : await this.prisma.registration.count({
              where: { eventId, status: RegistrationStatus.CONFIRMED },
            });

      if (activeCount >= event.maxRegistrations) {
        throw new BadRequestException(
          'This event is fully booked! Registration limits have been reached.',
        );
      }
    }

    // 4. Detect and extract identity field
    let identityValue: string | null = null;
    let identityType: IdentityType | null = null;

    const identityField = event.formFields.find((f) => f.isIdentityField);
    if (identityField) {
      if (identityField.type !== 'EMAIL') {
        throw new BadRequestException('Identity field must be an EMAIL type.');
      }
      const rawIdentity = answers[identityField.id];
      if (rawIdentity && typeof rawIdentity === 'string') {
        identityValue = rawIdentity.trim().toLowerCase();
        identityType = IdentityType.EMAIL;
      }
    }

    // Generate a readable registration ID
    const suffix = crypto.randomBytes(4).toString('hex').toUpperCase();
    const formattedSlug = event.slug
      .replace(/[^a-zA-Z0-9-]/g, '')
      .toUpperCase();
    const registrationId = `REG-${formattedSlug}-${suffix}`;

    // 5. Store registration in database with unique constraint handling
    let registration: any;
    try {
      registration = await this.prisma.registration.create({
        data: {
          id: registrationId,
          eventId,
          answers,
          status: RegistrationStatus.CONFIRMED,
          identityValue,
          identityType,
        },
      });
    } catch (err: any) {
      if (err?.code === 'P2002') {
        throw new ConflictException(
          'This email address is already registered for this event.',
        );
      }
      throw err;
    }

    // 6. Side effects: Emit webhook and dispatch emails asynchronously
    if (registration) {
      this.webhooksService
        .emit(event.organizationId, 'registration.created', {
          event: {
            id: event.id,
            title: event.title,
            slug: event.slug,
          },
          registration: {
            id: registration.id,
            status: registration.status,
            createdAt: registration.createdAt,
          },
        })
        .catch(() => {});

      if (identityValue) {
        this.emailService
          .enqueueConfirmation(
            identityValue,
            event.title,
            event.date ? new Date(event.date).toISOString() : null,
            event.location,
            registration.id,
          )
          .catch(() => {});
      }

      // Notify organizer asynchronously
      this.prisma.user
        ?.findFirst({
          where: { organizationId: event.organizationId },
          select: { email: true },
        })
        ?.then((orgUser) => {
          if (orgUser?.email) {
            this.emailService.enqueueOrganizerAlert(
              orgUser.email,
              event.title,
              identityValue || 'Attendee',
              registration.id,
            );
          }
        })
        ?.catch(() => {});
    }

    return registration;
  }

  async cancel(registrationId: string) {
    const registration = await this.prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            organizationId: true,
          },
        },
      },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    if (registration.status === RegistrationStatus.CANCELLED) {
      throw new ConflictException('Registration is already cancelled');
    }

    const updated = await this.prisma.registration.update({
      where: { id: registrationId },
      data: { status: RegistrationStatus.CANCELLED },
    });

    // Webhook emission
    this.webhooksService
      .emit(registration.event.organizationId, 'registration.cancelled', {
        event: {
          id: registration.event.id,
        },
        registration: {
          id: updated.id,
          status: updated.status,
          updatedAt: updated.updatedAt,
        },
      })
      .catch(() => {});

    // Cancellation email
    if (registration.identityValue) {
      this.emailService
        .enqueueCancellation(
          registration.identityValue,
          registration.event.title,
          updated.id,
        )
        .catch(() => {});
    }

    return updated;
  }
}
