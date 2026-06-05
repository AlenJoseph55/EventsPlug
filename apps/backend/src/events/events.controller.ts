import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  Res,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { EventsService, CreateEventDto } from './events.service';
import { ActiveOrgGuard } from '../auth/active-org.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@eventflow/types';
import { PrismaService } from '../prisma.service';
import { FORM_TEMPLATES } from '@eventflow/templates';

@Controller('api')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly prisma: PrismaService,
  ) {}

  // 1. Public endpoint - List events of an organization (used by embeddable widget)
  @Get('organizations/:slug/events')
  async getOrgEvents(@Param('slug') slug: string) {
    return this.eventsService.findByOrg(slug);
  }

  // 2. Public endpoint - Get single event detail of an organization
  @Get('organizations/:slug/events/:eventSlug')
  async getEventDetail(
    @Param('slug') slug: string,
    @Param('eventSlug') eventSlug: string,
  ) {
    return this.eventsService.findByOrgAndSlug(slug, eventSlug);
  }

  // 3. Protected endpoint - List all events (including inactive ones) of the authenticated user's organization
  @UseGuards(AuthGuard('jwt'), ActiveOrgGuard, RolesGuard)
  @Roles(
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.MEMBER,
    UserRole.SUPER_ADMIN,
  )
  @Get('events')
  async getAdminEvents(@Req() req: any) {
    return this.eventsService.findAllForAdmin(req.user.organizationId);
  }

  // 4. Protected endpoint - Create a new event (for organizers)
  @UseGuards(AuthGuard('jwt'), ActiveOrgGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPER_ADMIN)
  @Post('events')
  async createEvent(@Req() req: any, @Body() dto: CreateEventDto) {
    return this.eventsService.create(req.user.organizationId, dto);
  }

  // 5. Protected endpoint - Update/edit event details partially (for organizers)
  @UseGuards(AuthGuard('jwt'), ActiveOrgGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPER_ADMIN)
  @Patch('events/:eventId')
  async updateEvent(
    @Req() req: any,
    @Param('eventId') eventId: string,
    @Body() dto: any,
  ) {
    return this.eventsService.update(eventId, req.user.organizationId, dto);
  }

  // 6. Protected endpoint - Delete an event (for organizers)
  @UseGuards(AuthGuard('jwt'), ActiveOrgGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPER_ADMIN)
  @Delete('events/:eventId')
  async deleteEvent(@Req() req: any, @Param('eventId') eventId: string) {
    return this.eventsService.remove(eventId, req.user.organizationId);
  }

  // 7. Protected endpoint - View registrations list for an event
  @UseGuards(AuthGuard('jwt'), ActiveOrgGuard, RolesGuard)
  @Roles(
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.MEMBER,
    UserRole.SUPER_ADMIN,
  )
  @Get('events/:eventId/registrations')
  async getEventRegistrations(
    @Req() req: any,
    @Param('eventId') eventId: string,
  ) {
    return this.eventsService.getRegistrations(
      eventId,
      req.user.organizationId,
    );
  }

  // 8. Protected endpoint - Export registrations list as CSV
  @UseGuards(AuthGuard('jwt'), ActiveOrgGuard, RolesGuard)
  @Roles(
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.MEMBER,
    UserRole.SUPER_ADMIN,
  )
  @Get('events/:eventId/registrations/export')
  async exportEventRegistrations(
    @Req() req: any,
    @Param('eventId') eventId: string,
    @Res() res: Response,
  ) {
    const csvContent = await this.eventsService.exportRegistrationsCsv(
      eventId,
      req.user.organizationId,
    );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=registrations-${eventId}-${Date.now()}.csv`,
    );
    res.status(200).send(csvContent);
  }

  // 9. Protected Endpoint - Add a Custom Field (Checks ownership & 20 fields max cap)
  @UseGuards(AuthGuard('jwt'), ActiveOrgGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPER_ADMIN)
  @Post('events/:eventId/fields')
  async addCustomField(
    @Req() req: any,
    @Param('eventId') eventId: string,
    @Body()
    dto: {
      type: string;
      label: string;
      placeholder?: string;
      required?: boolean;
      options?: any;
    },
  ) {
    // IDOR protection
    const event = await this.prisma.event.findFirst({
      where: { id: eventId, organizationId: req.user.organizationId },
      include: { _count: { select: { formFields: true } } },
    });

    if (!event) {
      throw new NotFoundException('Event not found or access denied');
    }

    if (event._count.formFields >= 20) {
      throw new BadRequestException(
        'Form builder limit reached: events cannot exceed 20 fields.',
      );
    }

    // Determine default order index
    const lastField = await this.prisma.formField.findFirst({
      where: { eventId },
      orderBy: { order: 'desc' },
    });
    const orderIndex = lastField ? lastField.order + 1 : 0;

    return this.prisma.formField.create({
      data: {
        eventId,
        type: String(dto.type).toUpperCase() as any,
        label: dto.label,
        placeholder: dto.placeholder || null,
        required: !!dto.required,
        options: dto.options
          ? typeof dto.options === 'string'
            ? dto.options
            : JSON.stringify(dto.options)
          : '[]',
        order: orderIndex,
      },
    });
  }

  // 12. Protected Endpoint - Transactional Bulk Reordering
  // IMPORTANT: Must be declared BEFORE fields/:id so NestJS doesn't match "reorder" as a field ID
  @UseGuards(AuthGuard('jwt'), ActiveOrgGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPER_ADMIN)
  @Patch('events/:eventId/fields/reorder')
  async reorderFields(
    @Req() req: any,
    @Param('eventId') eventId: string,
    @Body() dto: { id: string; order: number }[],
  ) {
    // IDOR protection
    const event = await this.prisma.event.findFirst({
      where: { id: eventId, organizationId: req.user.organizationId },
    });

    if (!event) {
      throw new NotFoundException('Event not found or access denied');
    }

    if (!Array.isArray(dto)) {
      throw new BadRequestException(
        'Payload must be an array of { id, order }',
      );
    }

    // Execute bulk reorders inside a secure Prisma Transaction block
    await this.prisma.$transaction(
      dto.map((item) =>
        this.prisma.formField.updateMany({
          where: { id: item.id, eventId },
          data: { order: Number(item.order) },
        }),
      ),
    );

    return { success: true };
  }

  // 10. Protected Endpoint - Edit an Individual Field (Checks ownership)
  @UseGuards(AuthGuard('jwt'), ActiveOrgGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPER_ADMIN)
  @Patch('events/:eventId/fields/:id')
  async editCustomField(
    @Req() req: any,
    @Param('eventId') eventId: string,
    @Param('id') fieldId: string,
    @Body()
    dto: {
      type?: string;
      label?: string;
      placeholder?: string;
      required?: boolean;
      options?: any;
    },
  ) {
    // IDOR protection
    const event = await this.prisma.event.findFirst({
      where: { id: eventId, organizationId: req.user.organizationId },
    });

    if (!event) {
      throw new NotFoundException('Event not found or access denied');
    }

    const field = await this.prisma.formField.findFirst({
      where: { id: fieldId, eventId },
    });

    if (!field) {
      throw new NotFoundException('Form field not found');
    }

    const updateData: any = {};
    if (dto.type !== undefined)
      updateData.type = String(dto.type).toUpperCase() as any;
    if (dto.label !== undefined) updateData.label = dto.label;
    if (dto.placeholder !== undefined) updateData.placeholder = dto.placeholder;
    if (dto.required !== undefined) updateData.required = !!dto.required;
    if (dto.options !== undefined) {
      updateData.options =
        typeof dto.options === 'string'
          ? dto.options
          : JSON.stringify(dto.options);
    }

    return this.prisma.formField.update({
      where: { id: fieldId },
      data: updateData,
    });
  }

  // 11. Protected Endpoint - Clear all custom registration fields
  // IMPORTANT: Must be declared BEFORE fields/:id so NestJS doesn't match "clear" as a field ID
  @UseGuards(AuthGuard('jwt'), ActiveOrgGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPER_ADMIN)
  @Delete('events/:eventId/fields/clear')
  async clearAllFields(@Req() req: any, @Param('eventId') eventId: string) {
    // IDOR protection
    const event = await this.prisma.event.findFirst({
      where: { id: eventId, organizationId: req.user.organizationId },
    });

    if (!event) {
      throw new NotFoundException('Event not found or access denied');
    }

    await this.prisma.formField.deleteMany({
      where: { eventId },
    });

    return {
      success: true,
      message: 'All custom fields removed successfully.',
    };
  }

  // 12. Protected Endpoint - Delete a Field by ID (Checks ownership)
  @UseGuards(AuthGuard('jwt'), ActiveOrgGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPER_ADMIN)
  @Delete('events/:eventId/fields/:id')
  async deleteCustomField(
    @Req() req: any,
    @Param('eventId') eventId: string,
    @Param('id') fieldId: string,
  ) {
    // IDOR protection
    const event = await this.prisma.event.findFirst({
      where: { id: eventId, organizationId: req.user.organizationId },
    });

    if (!event) {
      throw new NotFoundException('Event not found or access denied');
    }

    const field = await this.prisma.formField.findFirst({
      where: { id: fieldId, eventId },
    });

    if (!field) {
      throw new NotFoundException('Form field not found');
    }

    return this.prisma.formField.delete({
      where: { id: fieldId },
    });
  }

  // 13. Protected Endpoint - Bulk Apply Preset fields (APPEND or REPLACE)
  @UseGuards(AuthGuard('jwt'), ActiveOrgGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPER_ADMIN)
  @Post('events/:eventId/fields/preset')
  async applyPresetFields(
    @Req() req: any,
    @Param('eventId') eventId: string,
    @Body() dto: { preset: string; mode: 'APPEND' | 'REPLACE' },
  ) {
    // IDOR protection
    const event = await this.prisma.event.findFirst({
      where: { id: eventId, organizationId: req.user.organizationId },
      include: { formFields: { orderBy: { order: 'asc' } } },
    });

    if (!event) {
      throw new NotFoundException('Event not found or access denied');
    }

    const template = FORM_TEMPLATES[dto.preset as any];
    if (!template) {
      throw new BadRequestException(
        `Template preset "${dto.preset}" not found.`,
      );
    }

    const mode = dto.mode || 'APPEND';

    if (mode === 'REPLACE') {
      // Replace completely: transactionally delete existing fields and create preset fields
      const newFields = template.fields.map((f, idx) => ({
        eventId,
        type: f.type.toUpperCase(),
        label: f.label,
        placeholder: f.placeholder || null,
        required: !!f.required,
        options: f.options ? JSON.stringify(f.options) : '[]',
        order: idx,
      }));

      await this.prisma.$transaction([
        this.prisma.formField.deleteMany({ where: { eventId } }),
        this.prisma.formField.createMany({ data: newFields }),
      ]);
    } else {
      // APPEND mode
      const currentCount = event.formFields.length;
      const newCount = template.fields.length;
      if (currentCount + newCount > 20) {
        throw new BadRequestException(
          `Form builder cap exceeded. Appending this preset would result in ${currentCount + newCount} fields, exceeding the 20 fields max limit.`,
        );
      }

      const startingOrder =
        currentCount > 0 ? event.formFields[currentCount - 1].order + 1 : 0;
      const newFields = template.fields.map((f, idx) => ({
        eventId,
        type: f.type.toUpperCase(),
        label: f.label,
        placeholder: f.placeholder || null,
        required: !!f.required,
        options: f.options ? JSON.stringify(f.options) : '[]',
        order: startingOrder + idx,
      }));

      await this.prisma.formField.createMany({ data: newFields });
    }

    // Return the updated fields list
    return this.prisma.formField.findMany({
      where: { eventId },
      orderBy: { order: 'asc' },
    });
  }
}
