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
import { AuthGuard } from '@nestjs/passport';
import { ApiKeysService } from './api-keys.service';
import { ActiveOrgGuard } from '../auth/active-org.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@eventflow/types';

class CreateApiKeyDto {
  name: string;
}

@Controller('api/api-keys')
@UseGuards(AuthGuard('jwt'), ActiveOrgGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.ORGANIZER, UserRole.SUPER_ADMIN)
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  async create(@Req() req: any, @Body() dto: CreateApiKeyDto) {
    if (!dto.name || typeof dto.name !== 'string' || !dto.name.trim()) {
      throw new BadRequestException('API key name is required');
    }
    return this.apiKeysService.create(req.user.organizationId, dto.name.trim());
  }

  @Get()
  async list(@Req() req: any) {
    return this.apiKeysService.list(req.user.organizationId);
  }

  @Delete(':id')
  async revoke(@Req() req: any, @Param('id') id: string) {
    return this.apiKeysService.revoke(id, req.user.organizationId);
  }
}
