import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  // 1. Create Stripe Payment Intent for USD / Global events
  async createStripeIntent(eventId: string, answers: any) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { organization: true, formFields: true },
    });

    if (!event) throw new NotFoundException('Event not found');
    if (event.paymentGateway !== 'STRIPE') {
      throw new BadRequestException('This event is not configured for Stripe payments.');
    }
    if (!event.organization.stripeAccountId) {
      throw new BadRequestException('Organizer has not connected a Stripe account yet.');
    }

    // Create initial pending registration
    const registration = await this.prisma.registration.create({
      data: {
        eventId: event.id,
        answers: answers || {},
        paymentStatus: 'PENDING_PAYMENT',
        paymentAmount: event.price,
        currency: event.currency || 'USD',
      },
    });

    // Generate simulated/Stripe payment intent payload
    const mockIntentId = `pi_stripe_${registration.id.replace(/-/g, '').slice(0, 16)}`;
    const clientSecret = `${mockIntentId}_secret_${Date.now()}`;

    // Record transaction ID on pending registration
    await this.prisma.registration.update({
      where: { id: registration.id },
      data: { paymentTxnId: mockIntentId },
    });

    return {
      registrationId: registration.id,
      clientSecret,
      paymentIntentId: mockIntentId,
      amount: event.price,
      currency: event.currency || 'USD',
      stripeAccountId: event.organization.stripeAccountId,
    };
  }

  // 2. Create Razorpay Order for India UPI / Cards / Netbanking
  async createRazorpayOrder(eventId: string, answers: any) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { organization: true, formFields: true },
    });

    if (!event) throw new NotFoundException('Event not found');
    if (event.paymentGateway !== 'RAZORPAY') {
      throw new BadRequestException('This event is not configured for Razorpay payments.');
    }
    if (!event.organization.razorpayKeyId) {
      throw new BadRequestException('Organizer has not configured Razorpay credentials.');
    }

    const registration = await this.prisma.registration.create({
      data: {
        eventId: event.id,
        answers: answers || {},
        paymentStatus: 'PENDING_PAYMENT',
        paymentAmount: event.price,
        currency: event.currency || 'INR',
      },
    });

    const orderId = `order_rzp_${registration.id.replace(/-/g, '').slice(0, 14)}`;

    await this.prisma.registration.update({
      where: { id: registration.id },
      data: { paymentTxnId: orderId },
    });

    return {
      registrationId: registration.id,
      orderId,
      keyId: event.organization.razorpayKeyId,
      amount: event.price, // Amount in paisa
      currency: event.currency || 'INR',
    };
  }

  // 3. Submit Manual UPI QR Registration (Zero-Fee India)
  async submitManualUpiRegistration(eventId: string, utrRef: string, answers: any) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) throw new NotFoundException('Event not found');
    if (event.paymentGateway !== 'MANUAL_UPI') {
      throw new BadRequestException('This event does not accept manual UPI QR submissions.');
    }
    if (!utrRef || utrRef.trim().length < 6) {
      throw new BadRequestException('Please provide a valid UTR / Payment Transaction reference ID.');
    }

    return this.prisma.registration.create({
      data: {
        eventId: event.id,
        answers: answers || {},
        paymentStatus: 'PENDING_PAYMENT',
        paymentAmount: event.price,
        currency: event.currency || 'INR',
        paymentTxnId: utrRef.trim(),
      },
    });
  }

  // 4. Confirm Payment Status (Invoked by webhooks or client polling)
  async confirmPayment(registrationId: string, txnRef?: string) {
    const reg = await this.prisma.registration.findUnique({
      where: { id: registrationId },
    });

    if (!reg) throw new NotFoundException('Registration not found');

    return this.prisma.registration.update({
      where: { id: registrationId },
      data: {
        paymentStatus: 'PAID',
        paymentTxnId: txnRef || reg.paymentTxnId || `txn_${Date.now()}`,
      },
    });
  }

  // 5. Update Organization Gateway Credentials
  async updateOrgGateways(
    orgId: string,
    dto: {
      stripeAccountId?: string;
      razorpayKeyId?: string;
      razorpayKeySecret?: string;
    },
  ) {
    return this.prisma.organization.update({
      where: { id: orgId },
      data: {
        stripeAccountId: dto.stripeAccountId !== undefined ? dto.stripeAccountId : undefined,
        razorpayKeyId: dto.razorpayKeyId !== undefined ? dto.razorpayKeyId : undefined,
        razorpayKeySecret: dto.razorpayKeySecret !== undefined ? dto.razorpayKeySecret : undefined,
      },
    });
  }

  // 6. Handle Razorpay HMAC Signature Webhook Verification
  verifyRazorpaySignature(body: string, signature: string, secret: string): boolean {
    if (!secret || !signature) return false;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');
    return expectedSignature === signature;
  }
}
