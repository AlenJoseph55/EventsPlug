import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PrismaService } from '../prisma.service';
import { UserRole, OrganizationStatus } from '@eventflow/types';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
@Controller('api/admin')
export class TenantsController {
  constructor(private prisma: PrismaService) {}

  // 1. Get all platform tenants with statistics
  @Get('tenants')
  async getAllTenants() {
    const orgs = await this.prisma.organization.findMany({
      include: {
        _count: {
          select: {
            events: true,
            users: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Resolve exact registration counts across all events per tenant
    return Promise.all(
      orgs.map(async (org) => {
        const registrationsCount = await this.prisma.registration.count({
          where: {
            event: { organizationId: org.id },
          },
        });

        return {
          id: org.id,
          name: org.name,
          slug: org.slug,
          logoUrl: org.logoUrl,
          status: org.status,
          createdAt: org.createdAt,
          updatedAt: org.updatedAt,
          eventsCount: org._count.events,
          usersCount: org._count.users,
          registrationsCount,
        };
      }),
    );
  }

  // 2. Programmatically provision a new tenant
  @Post('tenants')
  async createTenant(
    @Body() dto: { name: string; slug: string; logoUrl?: string },
  ) {
    const slug = dto.slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '');

    const existing = await this.prisma.organization.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new ConflictException(
        'This organization URL slug is already taken.',
      );
    }

    return this.prisma.organization.create({
      data: {
        name: dto.name,
        slug,
        logoUrl: dto.logoUrl || null,
      },
    });
  }

  // 3. Edit tenant properties (disallowing slug updates - Option A)
  @Patch('tenants/:id')
  async updateTenant(
    @Param('id') id: string,
    @Body()
    dto: { name?: string; logoUrl?: string; status?: OrganizationStatus },
  ) {
    const org = await this.prisma.organization.findUnique({
      where: { id },
    });

    if (!org) {
      throw new NotFoundException('Organization not found.');
    }

    return this.prisma.organization.update({
      where: { id },
      data: {
        name: dto.name !== undefined ? dto.name : undefined,
        logoUrl: dto.logoUrl !== undefined ? dto.logoUrl : undefined,
        status: dto.status !== undefined ? dto.status : undefined,
      },
    });
  }

  // 4. Read-only impersonation: Fetch events of a specific tenant
  @Get('tenants/:id/events')
  async getTenantEvents(@Param('id') id: string) {
    const org = await this.prisma.organization.findUnique({ where: { id } });
    if (!org) {
      throw new NotFoundException('Organization not found.');
    }

    return this.prisma.event.findMany({
      where: { organizationId: id },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 5. Read-only impersonation: Fetch registrations of a specific tenant
  @Get('tenants/:id/registrations')
  async getTenantRegistrations(@Param('id') id: string) {
    const org = await this.prisma.organization.findUnique({ where: { id } });
    if (!org) {
      throw new NotFoundException('Organization not found.');
    }

    return this.prisma.registration.findMany({
      where: {
        event: { organizationId: id },
      },
      include: {
        event: {
          select: {
            title: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 6. Aggregate platform-wide global metrics
  @Get('metrics')
  async getGlobalMetrics() {
    const [totalTenants, suspendedTenants, totalEvents, totalRegistrations] =
      await Promise.all([
        this.prisma.organization.count(),
        this.prisma.organization.count({
          where: { status: OrganizationStatus.SUSPENDED },
        }),
        this.prisma.event.count(),
        this.prisma.registration.count(),
      ]);

    return {
      totalTenants,
      activeTenants: totalTenants - suspendedTenants,
      suspendedTenants,
      totalEvents,
      totalRegistrations,
    };
  }
}
