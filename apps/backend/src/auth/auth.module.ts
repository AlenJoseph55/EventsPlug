import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from '../prisma.service';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from './roles.guard';
import { ActiveOrgGuard } from './active-org.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret:
        process.env.JWT_SECRET || 'eventsplug-super-secret-key-change-in-prod',
      signOptions: {
        expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    PrismaService,
    RolesGuard,
    ActiveOrgGuard,
  ],
  exports: [
    JwtStrategy,
    PassportModule,
    AuthService,
    RolesGuard,
    ActiveOrgGuard,
    PrismaService,
  ],
})
export class AuthModule {}
