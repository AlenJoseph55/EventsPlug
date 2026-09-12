import {
  Controller,
  Post,
  Patch,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
  BadRequestException,
  Headers,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaymentsService } from './payments.service';
import { ActiveOrgGuard } from '../auth/active-org.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@eventflow/types';

@Controller('api')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // 1. Public Endpoint - Initialize Stripe Intent for an event
  @Post('events/:eventId/payments/stripe/init')
  async initStripePayment(
    @Param('eventId') eventId: string,
    @Body() dto: { answers: any },
  ) {
    return this.paymentsService.createStripeIntent(eventId, dto.answers);
  }

  // 2. Public Endpoint - Initialize Razorpay Order for an event
  @Post('events/:eventId/payments/razorpay/init')
  async initRazorpayPayment(
    @Param('eventId') eventId: string,
    @Body() dto: { answers: any },
  ) {
    return this.paymentsService.createRazorpayOrder(eventId, dto.answers);
  }

  // 3. Public Endpoint - Submit Manual UPI QR Registration with UTR Ref
  @Post('events/:eventId/payments/manual-upi')
  async submitManualUpi(
    @Param('eventId') eventId: string,
    @Body() dto: { utrRef: string; answers: any },
  ) {
    return this.paymentsService.submitManualUpiRegistration(
      eventId,
      dto.utrRef,
      dto.answers,
    );
  }

  // 4. Public Endpoint - Confirm Payment Completion (Stripe/Razorpay client callback)
  @Post('registrations/:id/confirm-payment')
  async confirmPayment(
    @Param('id') registrationId: string,
    @Body() dto: { txnRef?: string },
  ) {
    return this.paymentsService.confirmPayment(registrationId, dto.txnRef);
  }

  // 5. Protected Endpoint - Update Organization Payment Gateway Settings
  @UseGuards(AuthGuard('jwt'), ActiveOrgGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPER_ADMIN)
  @Patch('organization/gateways')
  async updateOrgGateways(
    @Req() req: any,
    @Body()
    dto: {
      stripeAccountId?: string;
      razorpayKeyId?: string;
      razorpayKeySecret?: string;
    },
  ) {
    return this.paymentsService.updateOrgGateways(
      req.user.organizationId,
      dto,
    );
  }

  // 6. Public Webhook Endpoint - Stripe Webhook
  @Post('webhooks/stripe')
  async stripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Body() payload: any,
  ) {
    if (payload?.type === 'payment_intent.succeeded') {
      const intent = payload.data?.object;
      const regId = intent?.metadata?.registrationId;
      if (regId) {
        await this.paymentsService.confirmPayment(regId, intent.id);
      }
    }
    return { received: true };
  }

  // 7. Public Webhook Endpoint - Razorpay Webhook
  @Post('webhooks/razorpay')
  async razorpayWebhook(
    @Headers('x-razorpay-signature') signature: string,
    @Body() payload: any,
  ) {
    if (payload?.event === 'order.paid' || payload?.event === 'payment.authorized') {
      const payment = payload.payload?.payment?.entity;
      const regId = payment?.notes?.registrationId;
      if (regId) {
        await this.paymentsService.confirmPayment(regId, payment.id);
      }
    }
    return { status: 'ok' };
  }
}
