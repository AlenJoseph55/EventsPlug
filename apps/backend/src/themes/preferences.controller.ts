import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ActiveOrgGuard } from '../auth/active-org.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@eventflow/types';
import { PrismaService } from '../prisma.service';
import { WidgetLayout } from '@prisma/client';

@UseGuards(AuthGuard('jwt'), ActiveOrgGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('api')
export class PreferencesController {
  constructor(private readonly prisma: PrismaService) {}

  // 1. Organizer Endpoint - List all themes for current organization
  @Get('themes')
  async getThemes() {
    const themes = await this.prisma.widgetTheme.findMany({
      orderBy: { createdAt: 'asc' },
    });

    return themes.map((t) => ({
      ...t,
      isUnlocked: true,
    }));
  }

  // 2. Organizer Endpoint - Set organization-level default theme
  @Patch('organizations/default-theme')
  async updateOrgDefaultTheme(
    @Req() req: any,
    @Body() body: { themeId: string | null },
  ) {
    const orgId = req.user.organizationId;
    const { themeId } = body;

    if (themeId) {
      const theme = await this.prisma.widgetTheme.findUnique({
        where: { id: themeId },
      });

      if (!theme) {
        throw new NotFoundException('Theme not found.');
      }
    }

    const updatedOrg = await this.prisma.organization.update({
      where: { id: orgId },
      data: { defaultThemeId: themeId },
      include: { defaultTheme: true },
    });

    return {
      message:
        'Organization brand preferences default theme updated successfully!',
      defaultTheme: updatedOrg.defaultTheme,
    };
  }

  // 3. Organizer Endpoint - Set specific event override theme
  @Patch('events/:eventId/theme')
  async updateEventThemeOverride(
    @Req() req: any,
    @Param('eventId') eventId: string,
    @Body() body: { themeId: string | null },
  ) {
    const orgId = req.user.organizationId;
    const { themeId } = body;

    // Verify event ownership
    const event = await this.prisma.event.findFirst({
      where: { id: eventId, organizationId: orgId },
    });

    if (!event) {
      throw new NotFoundException('Event not found or unauthorized.');
    }

    if (themeId) {
      const theme = await this.prisma.widgetTheme.findUnique({
        where: { id: themeId },
      });

      if (!theme) {
        throw new NotFoundException('Theme not found.');
      }
    }

    const updatedEvent = await this.prisma.event.update({
      where: { id: eventId },
      data: { themeId },
      include: { theme: true },
    });

    return {
      message: 'Event override theme updated successfully!',
      theme: updatedEvent.theme,
    };
  }

  // 4. Organizer Endpoint - Set organization default layout and card limits preferences
  @Patch('organizations/preferences')
  async updateOrgPreferences(
    @Req() req: any,
    @Body() body: { layout: string; limit: number | null },
  ) {
    const orgId = req.user.organizationId;
    const { layout, limit } = body;

    if (layout && !['GRID', 'LIST', 'CAROUSEL'].includes(layout)) {
      throw new BadRequestException(
        'Invalid layout. Allowed: GRID, LIST, CAROUSEL',
      );
    }

    if (
      limit !== null &&
      (typeof limit !== 'number' || limit <= 0 || isNaN(limit))
    ) {
      throw new BadRequestException(
        'Limit must be null or a positive integer.',
      );
    }

    const updatedOrg = await this.prisma.organization.update({
      where: { id: orgId },
      data: {
        defaultLayout: layout as WidgetLayout,
        defaultLimit: limit,
      },
    });

    return {
      message: 'Organization preferences updated successfully!',
      preferences: {
        defaultLayout: updatedOrg.defaultLayout,
        defaultLimit: updatedOrg.defaultLimit,
      },
    };
  }

  // 5. Organizer Endpoint - Get organization hub customization preferences
  @Get('organizations/customization')
  async getOrgCustomization(@Req() req: any) {
    const orgId = req.user.organizationId;
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      select: {
        hubTitle: true,
        hubDescription: true,
        hubLogoUrl: true,
        hubIcon: true,
        showCardDate: true,
        showCardLocation: true,
        showCardCapacity: true,
        hubLayout: true,
        hubThemeId: true,
        hubAccentColor: true,
        hubBgColor: true,
        hubBannerUrl: true,
        hubThemeStyle: true,
        autoFitImages: true,
      },
    });

    if (!org) {
      throw new NotFoundException('Organization not found.');
    }

    return org;
  }

  // 6. Organizer Endpoint - Update organization hub customization preferences
  @Patch('organizations/customization')
  async updateOrgCustomization(
    @Req() req: any,
    @Body()
    body: {
      hubTitle?: string;
      hubDescription?: string;
      hubLogoUrl?: string | null;
      hubIcon?: string;
      showCardDate?: boolean;
      showCardLocation?: boolean;
      showCardCapacity?: boolean;
      hubLayout?: 'GRID' | 'LIST' | 'CAROUSEL';
      hubThemeId?: string | null;
      hubAccentColor?: string | null;
      hubBgColor?: string | null;
      hubBannerUrl?: string | null;
      hubThemeStyle?: string;
      autoFitImages?: boolean;
    },
  ) {
    const orgId = req.user.organizationId;

    // Validate inputs if provided
    if (
      body.hubTitle !== undefined &&
      (typeof body.hubTitle !== 'string' || body.hubTitle.trim() === '')
    ) {
      throw new BadRequestException('Hub title must be a non-empty string.');
    }
    if (
      body.hubDescription !== undefined &&
      typeof body.hubDescription !== 'string'
    ) {
      throw new BadRequestException('Hub description must be a string.');
    }
    if (
      body.hubIcon !== undefined &&
      (typeof body.hubIcon !== 'string' || body.hubIcon.trim() === '')
    ) {
      throw new BadRequestException('Hub icon must be a non-empty string.');
    }
    if (
      body.hubLayout !== undefined &&
      !['GRID', 'LIST', 'CAROUSEL'].includes(body.hubLayout)
    ) {
      throw new BadRequestException('Invalid hub layout preference.');
    }
    if (
      body.hubThemeStyle !== undefined &&
      !['DOT_MATRIX', 'GRID_WARP', 'AURORA_GLOW'].includes(body.hubThemeStyle)
    ) {
      throw new BadRequestException('Invalid hub theme style preference.');
    }
    if (body.hubAccentColor !== undefined && body.hubAccentColor !== null) {
      if (typeof body.hubAccentColor !== 'string') {
        throw new BadRequestException('Hub accent color must be a string.');
      }
      const hexRegex = /^#[0-9A-Fa-f]{6}$/;
      if (!hexRegex.test(body.hubAccentColor)) {
        throw new BadRequestException(
          'Hub accent color must be a valid hex color code.',
        );
      }
    }
    if (body.hubBgColor !== undefined && body.hubBgColor !== null) {
      if (typeof body.hubBgColor !== 'string') {
        throw new BadRequestException('Hub background color must be a string.');
      }
      const hexRegex = /^#[0-9A-Fa-f]{6}$/;
      if (!hexRegex.test(body.hubBgColor)) {
        throw new BadRequestException(
          'Hub background color must be a valid hex color code.',
        );
      }
    }
    if (body.hubBannerUrl !== undefined && body.hubBannerUrl !== null) {
      if (typeof body.hubBannerUrl !== 'string') {
        throw new BadRequestException('Hub banner URL must be a string.');
      }
    }
    if (
      body.autoFitImages !== undefined &&
      typeof body.autoFitImages !== 'boolean'
    ) {
      throw new BadRequestException(
        'autoFitImages preference must be a boolean.',
      );
    }

    const updatedOrg = await this.prisma.organization.update({
      where: { id: orgId },
      data: {
        hubTitle: body.hubTitle,
        hubDescription: body.hubDescription,
        hubLogoUrl: body.hubLogoUrl,
        hubIcon: body.hubIcon,
        showCardDate: body.showCardDate,
        showCardLocation: body.showCardLocation,
        showCardCapacity: body.showCardCapacity,
        hubLayout: body.hubLayout,
        hubThemeId: body.hubThemeId,
        hubAccentColor: body.hubAccentColor,
        hubBgColor: body.hubBgColor,
        hubBannerUrl: body.hubBannerUrl,
        hubThemeStyle: body.hubThemeStyle,
        autoFitImages: body.autoFitImages,
      },
    });

    return {
      message: 'Organization hub customization updated successfully!',
      customization: {
        hubTitle: updatedOrg.hubTitle,
        hubDescription: updatedOrg.hubDescription,
        hubLogoUrl: updatedOrg.hubLogoUrl,
        hubIcon: updatedOrg.hubIcon,
        showCardDate: updatedOrg.showCardDate,
        showCardLocation: updatedOrg.showCardLocation,
        showCardCapacity: updatedOrg.showCardCapacity,
        hubLayout: updatedOrg.hubLayout,
        hubThemeId: updatedOrg.hubThemeId,
        hubAccentColor: updatedOrg.hubAccentColor,
        hubBgColor: updatedOrg.hubBgColor,
        hubBannerUrl: updatedOrg.hubBannerUrl,
        hubThemeStyle: updatedOrg.hubThemeStyle,
        autoFitImages: updatedOrg.autoFitImages,
      },
    };
  }
}
