import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { ActiveOrgGuard } from '../auth/active-org.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@eventflow/types';

class CreateUserDto {
  email: string;
  passwordPlain: string;
  role: UserRole;
}

@UseGuards(AuthGuard('jwt'), ActiveOrgGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('api/organizations/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async getMembers(@Req() req: any) {
    return this.usersService.findAll(req.user.organizationId);
  }

  @Post()
  async addMember(@Req() req: any, @Body() dto: CreateUserDto) {
    return this.usersService.create(
      req.user.organizationId,
      dto.email,
      dto.passwordPlain,
      dto.role,
    );
  }

  @Delete(':id')
  async deleteMember(@Req() req: any, @Param('id') userId: string) {
    return this.usersService.remove(
      req.user.organizationId,
      userId,
      req.user.id,
    );
  }
}
