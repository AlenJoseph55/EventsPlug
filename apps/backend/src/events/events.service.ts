import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { FORM_TEMPLATES } from '@eventflow/templates';
import { OrganizationStatus } from '@eventflow/types';
import { EventStatus, RegistrationStatus } from '@prisma/client';
import { WebhooksService } from '../webhooks/webhooks.service';

export class CreateEventDto {
  title: string;
  description: string;
  date: string;
  location: string;
  isFeatured?: boolean;
  posterUrl?: string;
  maxRegistrations?: number;
  templatePreset?: string; // Optional starter preset
  formFields?: any[]; // Dynamic custom fields array
  registrationDeadline?: string;
  registrationTitle?: string;
  registrationDescription?: string;
  registrationButtonLabel?: string;
  price?: number;
  currency?: string;
  paymentGateway?: any;
  upiId?: string;
  upiQrUrl?: string;
}

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private webhooksService: WebhooksService,
  ) {}

  async create(organizationId: string, dto: CreateEventDto) {
    // 1. Generate unique slug
    let baseSlug = this.slugify(dto.title);
    if (!baseSlug) {
      baseSlug = 'event';
    }

    let uniqueSlug = baseSlug;
    let counter = 1;

    // Check collision within organization context
    while (true) {
      const collision = await this.prisma.event.findUnique({
        where: {
          organizationId_slug: {
            organizationId,
            slug: uniqueSlug,
          },
        },
      });

      if (!collision) {
        break;
      }
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Check featured limit if isFeatured is true
    if (dto.isFeatured) {
      const activeFeaturedCount = await this.prisma.event.count({
        where: {
          organizationId,
          isFeatured: true,
          status: EventStatus.ACTIVE,
        } as any,
      });

      if (activeFeaturedCount >= 3) {
        throw new BadRequestException(
          'An organization can have at most 3 featured events. Please unfeature another event first.',
        );
      }
    }

    // 2. Build initial form fields list
    let fieldsData: any[] = [];

    if (
      dto.templatePreset &&
      FORM_TEMPLATES[dto.templatePreset as keyof typeof FORM_TEMPLATES]
    ) {
      const template =
        FORM_TEMPLATES[dto.templatePreset as keyof typeof FORM_TEMPLATES];
      fieldsData = template.fields.map((f: any, idx: number) => ({
        type: f.type.toUpperCase(), // Convert e.g., 'text' -> 'TEXT', 'email' -> 'EMAIL'
        label: f.label,
        placeholder: f.placeholder || null,
        required: f.required || false,
        options: f.options ? JSON.stringify(f.options) : '[]',
        order: idx,
      }));
    } else if (Array.isArray(dto.formFields)) {
      // Enforce absolute defensive limit of 20 fields max
      const limitedFields = dto.formFields.slice(0, 20);
      fieldsData = limitedFields.map((f: any, idx: number) => ({
        type: String(f.type).toUpperCase(),
        label: f.label,
        placeholder: f.placeholder || null,
        required: !!f.required,
        options: f.options
          ? typeof f.options === 'string'
            ? f.options
            : JSON.stringify(f.options)
          : '[]',
        order: f.order !== undefined ? Number(f.order) : idx,
      }));
    } else {
      // Fallback default starter fields (Full Name, Email)
      fieldsData = [
        {
          type: 'TEXT',
          label: 'Full Name',
          placeholder: 'Enter your full name',
          required: true,
          order: 0,
          isIdentityField: false,
        },
        {
          type: 'EMAIL',
          label: 'Email Address',
          placeholder: 'you@example.com',
          required: true,
          order: 1,
          isIdentityField: true,
        },
      ];
    }

    // 3. Create the event
    return this.prisma.event.create({
      data: {
        organizationId,
        title: dto.title,
        slug: uniqueSlug,
        description: dto.description,
        date: new Date(dto.date),
        location: dto.location,
        posterUrl: dto.posterUrl || null,
        maxRegistrations: dto.maxRegistrations
          ? Number(dto.maxRegistrations)
          : null,
        ...((dto.isFeatured !== undefined ? { isFeatured: !!dto.isFeatured } : {}) as any),
        status: EventStatus.DRAFT,
        registrationDeadline: dto.registrationDeadline
          ? new Date(dto.registrationDeadline)
          : null,
        registrationTitle: dto.registrationTitle !== undefined
          ? this.cleanOptionalCopy(dto.registrationTitle, 80)
          : undefined,
        registrationDescription: dto.registrationDescription !== undefined
          ? this.cleanOptionalCopy(dto.registrationDescription, 180)
          : undefined,
        registrationButtonLabel: dto.registrationButtonLabel !== undefined
          ? this.cleanOptionalCopy(dto.registrationButtonLabel, 40)
          : undefined,
        price: dto.price ? Number(dto.price) : 0,
        currency: dto.currency || 'USD',
        paymentGateway: dto.paymentGateway || 'NONE',
        upiId: dto.upiId || null,
        upiQrUrl: dto.upiQrUrl || null,
        formFields: {
          create: fieldsData,
        },
      },
      include: {
        formFields: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async findByOrg(orgSlug: string) {
    const org = await this.prisma.organization.findUnique({
      where: { slug: orgSlug },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    if (org.status === OrganizationStatus.SUSPENDED) {
      throw new ForbiddenException('This organization is currently suspended.');
    }

    const events = await this.prisma.event.findMany({
      where: { organizationId: org.id, status: EventStatus.ACTIVE },
      orderBy: { date: 'asc' },
      include: {
        formFields: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { registrations: true },
        },
      },
    });

    return { organization: org, events };
  }

  async findAllForAdmin(
    organizationId: string,
    cursor?: string,
    limit: number = 50,
  ) {
    const take = Math.min(Math.max(Number(limit) || 50, 1), 100);

    const items = await this.prisma.event.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: take + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        formFields: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { registrations: true },
        },
      },
    });

    let nextCursor: string | null = null;
    if (items.length > take) {
      const nextItem = items.pop();
      nextCursor = nextItem!.id;
    }

    return {
      data: items,
      nextCursor,
    };
  }

  async update(eventId: string, orgId: string, dto: any) {
    // 1. Strict ownership validation scoping by both eventId and organizationId (IDOR protection)
    const event = await this.prisma.event.findFirst({
      where: { id: eventId, organizationId: orgId },
    });

    if (!event) {
      throw new NotFoundException('Event not found or access denied');
    }

    // 2. Map and update partial fields
    const updateData: any = {};
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.date !== undefined) updateData.date = new Date(dto.date);
    if (dto.location !== undefined) updateData.location = dto.location;
    if (dto.posterUrl !== undefined) updateData.posterUrl = dto.posterUrl;
    if (dto.accentColor !== undefined) updateData.accentColor = dto.accentColor;
    if (dto.maxRegistrations !== undefined) {
      updateData.maxRegistrations = dto.maxRegistrations
        ? Number(dto.maxRegistrations)
        : null;
    }
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.registrationDeadline !== undefined) {
      updateData.registrationDeadline = dto.registrationDeadline
        ? new Date(dto.registrationDeadline)
        : null;
    }
    if (dto.registrationTitle !== undefined) {
      updateData.registrationTitle = this.cleanOptionalCopy(dto.registrationTitle, 80);
    }
    if (dto.registrationDescription !== undefined) {
      updateData.registrationDescription = this.cleanOptionalCopy(dto.registrationDescription, 180);
    }
    if (dto.registrationButtonLabel !== undefined) {
      updateData.registrationButtonLabel = this.cleanOptionalCopy(dto.registrationButtonLabel, 40);
    }
    if (dto.price !== undefined) updateData.price = Number(dto.price);
    if (dto.currency !== undefined) updateData.currency = dto.currency;
    if (dto.paymentGateway !== undefined) updateData.paymentGateway = dto.paymentGateway;
    if (dto.upiId !== undefined) updateData.upiId = dto.upiId;
    if (dto.upiQrUrl !== undefined) updateData.upiQrUrl = dto.upiQrUrl;
    if (dto.isFeatured !== undefined) (updateData as any).isFeatured = !!dto.isFeatured;

    // Featured limit validation
    const targetStatus = dto.status !== undefined ? dto.status : event.status;
    const targetFeatured = dto.isFeatured !== undefined ? dto.isFeatured : (event as any).isFeatured;

    if (targetFeatured && targetStatus === EventStatus.ACTIVE) {
      const activeFeaturedCount = await this.prisma.event.count({
        where: {
          organizationId: orgId,
          isFeatured: true,
          status: EventStatus.ACTIVE,
          NOT: { id: eventId },
        } as any,
      });

      if (activeFeaturedCount >= 3) {
        throw new BadRequestException(
          'An organization can have at most 3 featured events. Please unfeature another event first.',
        );
      }
    }

    // 3. Handle title modifications and regeneration of slugs
    if (dto.title !== undefined && dto.title !== event.title) {
      let baseSlug = this.slugify(dto.title);
      if (!baseSlug) baseSlug = 'event';
      let uniqueSlug = baseSlug;
      let counter = 1;

      while (true) {
        const collision = await this.prisma.event.findFirst({
          where: {
            organizationId: orgId,
            slug: uniqueSlug,
            NOT: { id: eventId },
          },
        });

        if (!collision) break;
        uniqueSlug = `${baseSlug}-${counter}`;
        counter++;
      }
      updateData.slug = uniqueSlug;
    }

    // 4. Update the event
    const oldStatus = event.status;
    const updated = await this.prisma.event.update({
      where: { id: eventId },
      data: updateData,
      include: {
        formFields: {
          orderBy: { order: 'asc' },
        },
      },
    });

    // 5. Emit webhooks on status transitions
    if (updated && dto.status !== undefined && dto.status !== oldStatus) {
      if (dto.status === EventStatus.ACTIVE) {
        this.webhooksService
          .emit(orgId, 'event.published', {
            event: {
              id: updated.id,
              title: updated.title,
              slug: updated.slug,
            },
          })
          .catch(() => {});
      } else if (dto.status === EventStatus.CLOSED) {
        this.webhooksService
          .emit(orgId, 'event.closed', {
            event: {
              id: updated.id,
              title: updated.title,
              slug: updated.slug,
            },
          })
          .catch(() => {});
      }
    }

    return updated;
  }

  async remove(eventId: string, orgId: string) {
    // 1. Strict ownership validation scoping by both eventId and organizationId (IDOR protection)
    const event = await this.prisma.event.findFirst({
      where: { id: eventId, organizationId: orgId },
    });

    if (!event) {
      throw new NotFoundException('Event not found or access denied');
    }

    return this.prisma.event.delete({
      where: { id: eventId },
    });
  }

  async findByOrgAndSlug(orgSlug: string, eventSlug: string) {
    const org = await this.prisma.organization.findUnique({
      where: { slug: orgSlug },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    if (org.status === OrganizationStatus.SUSPENDED) {
      throw new ForbiddenException('This organization is currently suspended.');
    }

    const event = await this.prisma.event.findUnique({
      where: {
        organizationId_slug: {
          organizationId: org.id,
          slug: eventSlug,
        },
      },
      include: {
        formFields: {
          orderBy: { order: 'asc' },
        },
        organization: true,
        _count: {
          select: { registrations: true },
        },
      },
    });

    if (!event || event.status !== EventStatus.ACTIVE) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }


  private cleanOptionalCopy(value: unknown, maxLength: number) {
    if (value === null || value === undefined) return null;
    if (typeof value !== 'string') {
      throw new BadRequestException('Registration copy must be text.');
    }

    const cleaned = value.trim();
    if (cleaned.length > maxLength) {
      throw new BadRequestException(
        `Registration copy must be ${maxLength} characters or fewer.`,
      );
    }
    return cleaned || null;
  }

  async findPublicById(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        formFields: {
          orderBy: { order: 'asc' },
        },
        organization: {
          select: {
            id: true,
            slug: true,
            name: true,
            logoUrl: true,
          },
        },
        _count: {
          select: {
            registrations: {
              where: { status: RegistrationStatus.CONFIRMED },
            },
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return {
      ...event,
      registrationCount: event._count.registrations,
    };
  }

  async getRegistrations(
    eventId: string,
    organizationId: string,
    cursor?: string,
    limit: number = 50,
  ) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.organizationId !== organizationId) {
      throw new ForbiddenException(
        'You do not have permission to view registrations for this event.',
      );
    }

    const take = Math.min(Math.max(Number(limit) || 50, 1), 100);

    const items = await this.prisma.registration.findMany({
      where: { eventId },
      orderBy: { createdAt: 'desc' },
      take: take + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    let nextCursor: string | null = null;
    if (items.length > take) {
      const nextItem = items.pop();
      nextCursor = nextItem!.id;
    }

    return {
      data: items,
      nextCursor,
    };
  }

  async exportRegistrationsCsv(
    eventId: string,
    organizationId: string,
  ): Promise<string> {
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

    if (event.organizationId !== organizationId) {
      throw new ForbiddenException(
        'You do not have permission to export registrations for this event.',
      );
    }

    const registrations = await this.prisma.registration.findMany({
      where: { eventId },
      orderBy: { createdAt: 'asc' },
    });

    if (registrations.length === 0) {
      return 'Registration ID,Registration Date,Answers\n';
    }

    // Get ordered column headers mapping UUID/Labels
    const fields = event.formFields;

    // Construct CSV header row using safe labels
    let csvContent = `Registration ID,Registration Date,${fields.map((f) => this.escapeCsvValue(f.label)).join(',')}\n`;

    // Construct data rows mapping field IDs
    registrations.forEach((reg) => {
      const answers = (reg.answers as Record<string, any>) || {};
      const dateStr = new Date(reg.createdAt).toISOString();
      const rowValues = [
        reg.id,
        dateStr,
        ...fields.map((field) => {
          const val = answers[field.id];
          return val !== undefined && val !== null ? String(val) : '';
        }),
      ];
      csvContent +=
        rowValues.map((val) => this.escapeCsvValue(val)).join(',') + '\n';
    });

    return csvContent;
  }

  private slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  }

  private escapeCsvValue(val: string): string {
    const escaped = val.replace(/"/g, '""');
    if (
      escaped.includes(',') ||
      escaped.includes('\n') ||
      escaped.includes('"')
    ) {
      return `"${escaped}"`;
    }
    return escaped;
  }
}
