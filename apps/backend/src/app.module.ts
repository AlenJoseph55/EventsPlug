import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import Redis from 'ioredis';
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
import { PaymentsModule } from './payments/payments.module';
import { JobsModule } from './jobs/jobs.module';
import { ApiKeysModule } from './api-keys/api-keys.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    JobsModule,
    ApiKeysModule,
    WebhooksModule,
    EmailModule,
    AuthModule,
    EventsModule,
    RegistrationsModule,
    UploadsModule,
    AdminModule,
    UsersModule,
    PaymentsModule,
    ThrottlerModule.forRootAsync({
      useFactory: () => {
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
        return {
          throttlers: [
            {
              ttl: 60000, // 1 minute
              limit: 60, // 60 requests per minute
            },
          ],
          storage: new ThrottlerStorageRedisService(
            new Redis(redisUrl, { lazyConnect: true, maxRetriesPerRequest: null }),
          ),
        };
      },
    }),
  ],
  controllers: [AppController],
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

