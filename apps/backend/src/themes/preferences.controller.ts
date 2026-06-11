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

  // 1b. Organizer Endpoint - List all visual skins
  @Get('skins')
  async getSkins() {
    return this.prisma.widgetSkin.findMany({
      orderBy: { createdAt: 'asc' },
    });
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
      include: {
        hubTheme: true,
      },
    });

    if (!org) {
      throw new NotFoundException('Organization not found.');
    }

    return {
      hubTitle: org.hubTitle,
      hubDescription: org.hubDescription,
      hubLogoUrl: org.hubLogoUrl,
      hubIcon: org.hubIcon,
      showCardDate: org.showCardDate,
      showCardLocation: org.showCardLocation,
      showCardCapacity: org.showCardCapacity,
      hubLayout: org.hubLayout,
      hubThemeId: org.hubThemeId,
      hubSkinId: org.hubSkinId,
      hubBannerUrl: org.hubBannerUrl,
      hubThemeStyle: org.hubThemeStyle,
      autoFitImages: org.autoFitImages,
      // Theme settings derived from active theme
      baseMode: org.hubTheme?.baseMode,
      accentHue: org.hubTheme?.accentHue,
      accentChroma: org.hubTheme?.accentChroma,
      surfaceTone: org.hubTheme?.surfaceTone,
      skinId: org.hubTheme?.skinId,
      fontPairingId: org.hubTheme?.fontPairingId,
    };
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
      hubSkinId?: string | null;
      hubBannerUrl?: string | null;
      hubThemeStyle?: string;
      autoFitImages?: boolean;
      baseMode?: string;
      accentHue?: number;
      accentChroma?: number;
      surfaceTone?: string;
      skinId?: string;
      fontPairingId?: string;
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
      !['DOT_MATRIX', 'GRID_WARP', 'AURORA_GLOW', 'LIGHTFALL', 'SIDERAYS', 'LIGHTRAYS', 'AURORA', 'GRADIENT', 'PIXELSNOW', 'SHAPEGRID'].includes(body.hubThemeStyle)
    ) {
      throw new BadRequestException('Invalid hub theme style preference.');
    }
    if (body.hubSkinId !== undefined && body.hubSkinId !== null) {
      if (typeof body.hubSkinId !== 'string') {
        throw new BadRequestException('Hub skin ID must be a string.');
      }
      const skin = await this.prisma.widgetSkin.findUnique({
        where: { id: body.hubSkinId },
      });
      if (!skin) {
        throw new NotFoundException('Skin not found.');
      }
    }
    if (body.accentHue !== undefined && body.accentHue !== null) {
      if (typeof body.accentHue !== 'number' || body.accentHue < 0 || body.accentHue > 360) {
        throw new BadRequestException('Accent hue must be a number between 0 and 360.');
      }
    }
    if (body.accentChroma !== undefined && body.accentChroma !== null) {
      if (typeof body.accentChroma !== 'number' || body.accentChroma < 0 || body.accentChroma > 1) {
        throw new BadRequestException('Accent chroma must be a number between 0 and 1.');
      }
    }
    if (body.baseMode !== undefined && body.baseMode !== null) {
      if (!['dark', 'light', 'auto'].includes(body.baseMode)) {
        throw new BadRequestException('Invalid baseMode. Allowed: dark, light, auto');
      }
    }
    if (body.surfaceTone !== undefined && body.surfaceTone !== null) {
      if (!['deep', 'mid', 'soft'].includes(body.surfaceTone)) {
        throw new BadRequestException('Invalid surfaceTone. Allowed: deep, mid, soft');
      }
    }
    if (body.skinId !== undefined && body.skinId !== null) {
      if (!['frosted', 'sharp', 'soft', 'retro'].includes(body.skinId)) {
        throw new BadRequestException('Invalid skinId. Allowed: frosted, sharp, soft, retro');
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

    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      include: { hubTheme: true },
    });

    if (!org) {
      throw new NotFoundException('Organization not found.');
    }

    let targetThemeId = body.hubThemeId !== undefined ? body.hubThemeId : org.hubThemeId;
    let targetSkinId = body.hubSkinId !== undefined ? body.hubSkinId : org.hubSkinId;

    // Synchronize hubSkinId if skinId is explicitly customized
    if (body.skinId !== undefined && body.skinId !== null) {
      const skin = await this.prisma.widgetSkin.findUnique({
        where: { slug: body.skinId },
      });
      if (skin) {
        targetSkinId = skin.id;
      }
    }

    // Check if theme customizations are being sent
    const hasCustomizationProps =
      body.baseMode !== undefined ||
      body.accentHue !== undefined ||
      body.accentChroma !== undefined ||
      body.surfaceTone !== undefined ||
      body.skinId !== undefined ||
      body.fontPairingId !== undefined;

    if (hasCustomizationProps) {
      let customTheme = org.hubTheme;
      const expectedSlug = `org-custom-${orgId}`;
      
      if (!customTheme || customTheme.slug !== expectedSlug) {
        // Create custom theme copy or start with defaults
        const baseTheme = customTheme || {
          baseMode: 'dark',
          accentHue: 250,
          accentChroma: 0.18,
          surfaceTone: 'mid',
          skinId: 'frosted',
          fontPairingId: 'inter-inter',
        };

        customTheme = await this.prisma.widgetTheme.upsert({
          where: { slug: expectedSlug },
          update: {
            baseMode: body.baseMode !== undefined ? body.baseMode : baseTheme.baseMode,
            accentHue: body.accentHue !== undefined ? body.accentHue : baseTheme.accentHue,
            accentChroma: body.accentChroma !== undefined ? body.accentChroma : baseTheme.accentChroma,
            surfaceTone: body.surfaceTone !== undefined ? body.surfaceTone : baseTheme.surfaceTone,
            skinId: body.skinId !== undefined ? body.skinId : baseTheme.skinId,
            fontPairingId: body.fontPairingId !== undefined ? body.fontPairingId : baseTheme.fontPairingId,
          },
          create: {
            slug: expectedSlug,
            name: `${org.name} Custom Theme`,
            isPremium: false,
            price: 0,
            baseMode: body.baseMode !== undefined ? body.baseMode : baseTheme.baseMode,
            accentHue: body.accentHue !== undefined ? body.accentHue : baseTheme.accentHue,
            accentChroma: body.accentChroma !== undefined ? body.accentChroma : baseTheme.accentChroma,
            surfaceTone: body.surfaceTone !== undefined ? body.surfaceTone : baseTheme.surfaceTone,
            skinId: body.skinId !== undefined ? body.skinId : baseTheme.skinId,
            fontPairingId: body.fontPairingId !== undefined ? body.fontPairingId : baseTheme.fontPairingId,
          },
        });
        targetThemeId = customTheme.id;
      } else {
        // Update existing custom theme
        customTheme = await this.prisma.widgetTheme.update({
          where: { id: customTheme.id },
          data: {
            baseMode: body.baseMode !== undefined ? body.baseMode : undefined,
            accentHue: body.accentHue !== undefined ? body.accentHue : undefined,
            accentChroma: body.accentChroma !== undefined ? body.accentChroma : undefined,
            surfaceTone: body.surfaceTone !== undefined ? body.surfaceTone : undefined,
            skinId: body.skinId !== undefined ? body.skinId : undefined,
            fontPairingId: body.fontPairingId !== undefined ? body.fontPairingId : undefined,
          },
        });
        targetThemeId = customTheme.id;
      }
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
        hubThemeId: targetThemeId,
        hubSkinId: targetSkinId,
        hubBannerUrl: body.hubBannerUrl,
        hubThemeStyle: body.hubThemeStyle,
        autoFitImages: body.autoFitImages,
      },
      include: {
        hubTheme: true,
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
        hubSkinId: updatedOrg.hubSkinId,
        hubBannerUrl: updatedOrg.hubBannerUrl,
        hubThemeStyle: updatedOrg.hubThemeStyle,
        autoFitImages: updatedOrg.autoFitImages,
        baseMode: updatedOrg.hubTheme?.baseMode,
        accentHue: updatedOrg.hubTheme?.accentHue,
        accentChroma: updatedOrg.hubTheme?.accentChroma,
        surfaceTone: updatedOrg.hubTheme?.surfaceTone,
        skinId: updatedOrg.hubTheme?.skinId,
        fontPairingId: updatedOrg.hubTheme?.fontPairingId,
      },
    };
  }
}
