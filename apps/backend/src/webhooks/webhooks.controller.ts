import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { JwtOrApiKeyGuard } from '../auth/jwt-or-api-key.guard';
import { ActiveOrgGuard } from '../auth/active-org.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@eventflow/types';

class CreateWebhookEndpointDto {
  url: string;
  name?: string;
}

@Controller('api/webhooks/endpoints')
@UseGuards(JwtOrApiKeyGuard, ActiveOrgGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.ORGANIZER, UserRole.SUPER_ADMIN)
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post()
  async createEndpoint(@Req() req: any, @Body() dto: CreateWebhookEndpointDto) {
    if (!dto.url || typeof dto.url !== 'string') {
      throw new BadRequestException('Webhook URL is required');
    }
    return this.webhooksService.createEndpoint(
      req.user.organizationId,
      dto.url.trim(),
      dto.name,
    );
  }

  @Get()
  async listEndpoints(@Req() req: any) {
    return this.webhooksService.listEndpoints(req.user.organizationId);
  }

  @Delete(':id')
  async deleteEndpoint(@Req() req: any, @Param('id') id: string) {
    return this.webhooksService.deleteEndpoint(id, req.user.organizationId);
  }
}
