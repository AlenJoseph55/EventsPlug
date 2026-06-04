import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';
import { RegistrationsService } from './registrations.service';

class SubmitRegistrationDto {
  answers: Record<string, any>;
}

@Controller('api')
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  // 1. Protected endpoint - Retrieve registrations matching the current user's email
  @Get('registrations/my-registrations')
  @UseGuards(AuthGuard('jwt'))
  async getMyRegistrations(@Req() req: { user: { email: string } }) {
    return this.registrationsService.getRegistrationsByEmail(req.user.email);
  }

  // 1. Public endpoint - Submit a registration form (throttled strictly to 10 requests per min)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('events/:eventId/register')
  @HttpCode(HttpStatus.CREATED)
  async submitRegistration(
    @Param('eventId') eventId: string,
    @Body() dto: SubmitRegistrationDto,
  ) {
    return this.registrationsService.register(eventId, dto.answers);
  }
}
