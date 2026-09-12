# Tasks: US & India Direct Multi-Gateway Payments

## 1. Database Schema & Backend Core

- [x] 1.1 Update `schema.prisma` with `price`, `currency`, `paymentGateway`, `upiId`, `upiQrUrl` on `Event`.
- [x] 1.2 Update `schema.prisma` with `paymentStatus`, `paymentAmount`, `currency`, `paymentTxnId`, `paymentProofUrl` on `Registration`.
- [x] 1.3 Update `schema.prisma` with `stripeAccountId`, `razorpayKeyId`, `razorpayKeySecret` on `Organization`.
- [x] 1.4 Execute `prisma db push` to update PostgreSQL schema.

## 2. Gateway Integration & Webhooks (`apps/backend`)

- [x] 2.1 Create `PaymentsModule` and implement Stripe Connect Direct Charges service (`stripe.paymentIntents.create`).
- [x] 2.2 Implement Razorpay Order API integration (`razorpay.orders.create`) and HMAC signature verification.
- [x] 2.3 Implement webhook endpoints (`POST /api/webhooks/stripe`, `POST /api/webhooks/razorpay`) to confirm registrations upon payment.
- [x] 2.4 Add manual UPI QR payment registration endpoint recording 12-digit UTR reference ID.

## 3. Organizer Console Settings (`apps/dashboard`)

- [x] 3.1 Create Payment Gateways setup tab in organizer dashboard for Stripe OAuth Connect & Razorpay credentials.
- [x] 3.2 Update Event Builder to support ticket price input and currency selector (`USD`, `INR`).
- [x] 3.3 Update Submissions Data Table to show payment status badges (`FREE`, `PENDING_PAYMENT`, `PAID`) and transaction IDs.

## 4. Widget Payment Checkout (`apps/widget`)

- [x] 4.1 Update `<events-plug-widget>` to render ticket price header and currency symbol.
- [x] 4.2 Inject Stripe Elements & Razorpay Checkout modal triggers inside Shadow DOM.
- [x] 4.3 Add Manual UPI QR code view and UTR input step.

## 5. Verification & Testing

- [x] 5.1 Verify USD Stripe Connect payment workflow end-to-end.
- [x] 5.2 Verify INR Razorpay UPI payment workflow end-to-end.
- [x] 5.3 Verify Manual UPI QR workflow and CSV export containing payment columns.
