import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { RegistrationsModule } from './registrations/registrations.module';
import { UploadsModule } from './uploads/uploads.module';
import { AdminModule } from './admin/admin.module';
import { UsersModule } from './users/users.module';
import { PreferencesController } from './themes/preferences.controller';

@Module({
  imports: [
    AuthModule,
    EventsModule,
    RegistrationsModule,
    UploadsModule,
    AdminModule,
    UsersModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 60, // 60 requests per minute
      },
    ]),
  ],
  controllers: [AppController, PreferencesController],
  providers: [
    AppService,
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
