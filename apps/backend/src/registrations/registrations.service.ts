import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as crypto from 'crypto';
import { validateForm } from '@eventflow/validators';

@Injectable()
export class RegistrationsService {
  constructor(private prisma: PrismaService) {}

  async register(eventId: string, answers: Record<string, any>) {
    // 1. Fetch the event including its custom form fields
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        formFields: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { registrations: true },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // 2. Check registration limits
    if (
      event.maxRegistrations !== null &&
      event._count.registrations >= event.maxRegistrations
    ) {
      throw new BadRequestException(
        'This event is fully booked! Registration limits have been reached.',
      );
    }

    // 3. Dynamic custom validations using @eventflow/validators
    const validation = validateForm(answers, event.formFields, 'id');
    if (!validation.success) {
      throw new BadRequestException({
        message: 'Registration form validation failed.',
        errors: validation.errors,
      });
    }

    // Generate a readable registration ID containing hints of the event slug
    // Format: REG-[EVENT-SLUG-UPPERCASE]-[RANDOM-8-HEX]
    const suffix = crypto.randomBytes(4).toString('hex').toUpperCase();
    const formattedSlug = event.slug
      .replace(/[^a-zA-Z0-9-]/g, '')
      .toUpperCase();
    const registrationId = `REG-${formattedSlug}-${suffix}`;

    // 5. Store registration in database
    return this.prisma.registration.create({
      data: {
        id: registrationId,
        eventId,
        answers, // Saved natively as JSON column
      },
    });
  }

  async getRegistrationsByEmail(email: string) {
    return this.prisma.$queryRaw`
      SELECT 
        r.id,
        r."eventId",
        r.answers,
        r."createdAt",
        e.title as "eventTitle",
        e.date as "eventDate",
        e.location as "eventLocation",
        e.slug as "eventSlug",
        e."posterUrl" as "eventPosterUrl",
        o.slug as "orgSlug",
        o.name as "orgName"
      FROM "Registration" r
      JOIN "Event" e ON r."eventId" = e.id
      JOIN "Organization" o ON e."organizationId" = o.id
      WHERE EXISTS (
        SELECT 1 
        FROM jsonb_each_text(r.answers) 
        WHERE value = ${email}
      )
      ORDER BY r."createdAt" DESC;
    `;
  }
}
