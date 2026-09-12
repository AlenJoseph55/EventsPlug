import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import {
  QUEUE_EMAIL_NOTIFICATIONS,
  QUEUE_WEBHOOK_DELIVERY,
} from './jobs.constants';

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: () => {
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
        try {
          const url = new URL(redisUrl);
          return {
            connection: {
              host: url.hostname || 'localhost',
              port: parseInt(url.port || '6379', 10),
              password: url.password ? decodeURIComponent(url.password) : undefined,
              username: url.username ? decodeURIComponent(url.username) : undefined,
              maxRetriesPerRequest: null,
            },
          };
        } catch {
          return {
            connection: {
              host: 'localhost',
              port: 6379,
              maxRetriesPerRequest: null,
            },
          };
        }
      },
    }),
    BullModule.registerQueue(
      {
        name: QUEUE_EMAIL_NOTIFICATIONS,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 10000,
          },
          removeOnComplete: true,
          removeOnFail: { count: 100 },
        },
      },
      {
        name: QUEUE_WEBHOOK_DELIVERY,
        defaultJobOptions: {
          attempts: 5,
          backoff: {
            type: 'exponential',
            delay: 30000,
          },
          removeOnComplete: true,
          removeOnFail: { count: 100 },
        },
      },
    ),
  ],
  exports: [BullModule],
})
export class JobsModule {}
