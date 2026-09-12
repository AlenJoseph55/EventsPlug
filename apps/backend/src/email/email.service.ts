import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Resend } from 'resend';
import { QUEUE_EMAIL_NOTIFICATIONS } from '../jobs/jobs.constants';
import {
  renderConfirmationEmail,
  renderCancellationEmail,
  renderOrganizerNotificationEmail,
} from './email.templates';

export type EmailJobType =
  | 'registration-confirmation'
  | 'registration-cancellation'
  | 'organizer-alert';

export interface EmailJobData {
  type: EmailJobType;
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend | null = null;
  private fromEmail: string;

  constructor(
    @InjectQueue(QUEUE_EMAIL_NOTIFICATIONS)
    private readonly emailQueue: Queue,
  ) {
    const apiKey = process.env.RESEND_API_KEY;
    this.fromEmail =
      process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

    if (apiKey && !apiKey.includes('test_dummy')) {
      this.resend = new Resend(apiKey);
    } else {
      this.logger.log(
        'Resend API key not configured or set to dummy value; running in test/mock mode.',
      );
    }
  }

  async enqueueConfirmation(
    to: string,
    eventTitle: string,
    eventDate: string | null | undefined,
    eventLocation: string | null | undefined,
    registrationId: string,
  ) {
    if (!to || !to.includes('@')) return;

    const html = renderConfirmationEmail({
      eventTitle,
      eventDate,
      eventLocation,
      registrationId,
    });

    await this.emailQueue.add('confirmation', {
      type: 'registration-confirmation',
      to,
      subject: `Confirmed: You're registered for ${eventTitle}`,
      html,
    });
  }

  async enqueueCancellation(
    to: string,
    eventTitle: string,
    registrationId: string,
  ) {
    if (!to || !to.includes('@')) return;

    const html = renderCancellationEmail({
      eventTitle,
      registrationId,
    });

    await this.emailQueue.add('cancellation', {
      type: 'registration-cancellation',
      to,
      subject: `Registration Cancelled: ${eventTitle}`,
      html,
    });
  }

  async enqueueOrganizerAlert(
    to: string,
    eventTitle: string,
    attendeeEmail: string,
    registrationId: string,
  ) {
    if (!to || !to.includes('@')) return;

    const html = renderOrganizerNotificationEmail({
      eventTitle,
      attendeeEmail,
      registrationId,
    });

    await this.emailQueue.add('organizer-alert', {
      type: 'organizer-alert',
      to,
      subject: `New attendee for ${eventTitle}`,
      html,
    });
  }

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    if (!this.resend) {
      this.logger.log(`[MOCK EMAIL SENT] To: ${to} | Subject: ${subject}`);
      return;
    }

    const { error } = await this.resend.emails.send({
      from: this.fromEmail,
      to,
      subject,
      html,
    });

    if (error) {
      throw new Error(`Resend email delivery failed: ${error.message}`);
    }
  }
}
