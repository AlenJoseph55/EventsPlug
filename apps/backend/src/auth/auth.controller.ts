import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

class RegisterDto {
  email: string;
  password: string; // matches passwordHash parameter in service
  organizationName: string;
  organizationSlug: string;
}

class LoginDto {
  email: string;
  password: string;
}

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    return this.authService.register({
      email: dto.email,
      passwordHash: dto.password,
      organizationName: dto.organizationName,
      organizationSlug: dto.organizationSlug,
    });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login({
      email: dto.email,
      passwordHash: dto.password,
    });
  }
}
