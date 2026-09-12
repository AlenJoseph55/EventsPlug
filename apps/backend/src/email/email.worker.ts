import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_EMAIL_NOTIFICATIONS } from '../jobs/jobs.constants';
import { EmailService, EmailJobData } from './email.service';

@Processor(QUEUE_EMAIL_NOTIFICATIONS)
export class EmailWorker extends WorkerHost {
  private readonly logger = new Logger(EmailWorker.name);

  constructor(private readonly emailService: EmailService) {
    super();
  }

  async process(job: Job<EmailJobData>): Promise<void> {
    const { to, subject, html } = job.data;
    this.logger.log(`Processing email job ${job.id} for ${to}`);
    await this.emailService.sendEmail(to, subject, html);
  }
}
