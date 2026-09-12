import { Module, Global } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailWorker } from './email.worker';
import { JobsModule } from '../jobs/jobs.module';

@Global()
@Module({
  imports: [JobsModule],
  providers: [EmailService, EmailWorker],
  exports: [EmailService],
})
export class EmailModule {}
