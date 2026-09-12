import { Module, Global } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { WebhooksController } from './webhooks.controller';
import { WebhooksWorker } from './webhooks.worker';
import { PrismaService } from '../prisma.service';
import { JobsModule } from '../jobs/jobs.module';

@Global()
@Module({
  imports: [JobsModule],
  controllers: [WebhooksController],
  providers: [WebhooksService, WebhooksWorker, PrismaService],
  exports: [WebhooksService],
})
export class WebhooksModule {}
