## Why

Event organizers running paid workshops, meetups, or conferences in the United States and India require direct ticket collection into their own gateway accounts. Organizers in the US rely heavily on Credit/Debit Cards, Apple Pay, and Google Pay (via Stripe Connect), while organizers in India rely on instant UPI (Google Pay, PhonePe, Paytm, BHIM), Netbanking, and Cards (via Razorpay Direct/Route). Additionally, grassroots community organizers require a zero-fee direct UPI QR payment option.

## What Changes

- **Direct Gateway Integration (US & Global)**: Support Stripe Connect Direct Charges so US/Global ticket revenue flows directly into the organizer's Stripe account.
- **Direct Gateway Integration (India)**: Support Razorpay Route / Organizer API Credentials to accept instant UPI, Netbanking, and Indian debit/credit cards directly into the organizer's Indian bank account.
- **Manual / Direct UPI QR & Proof Mode**: Allow Indian community organizers to upload a UPI QR Code or VPA; attendees pay directly on their phone and attach a UTR/Transaction Reference ID.
- **Widget Payment Flow**: Extend `<events-plug-widget>` Shadow DOM form to present price details, currency switcher (`USD` / `INR`), and launch Stripe / Razorpay modal checkout seamlessly.
- **Backend Webhook Handler**: Process asynchronous payment webhooks (`payment_intent.succeeded` for Stripe, `payment.authorized` for Razorpay) to automatically confirm registrations upon payment.

## Capabilities

### New Capabilities
- `payments`: Direct organizer multi-gateway payment processing (Stripe Connect US/Global, Razorpay India UPI/Cards, Direct UPI QR proof).

### Modified Capabilities
- `events`: Support ticket price, currency (`USD`, `INR`), and payment gateway settings on event entities.
- `registrations`: Track payment status (`FREE`, `PENDING_PAYMENT`, `PAID`, `FAILED`), transaction IDs, and receipt references.
- `widget`: Render pricing breakdown, payment gateway triggers, and confirmation states inside Shadow DOM.

## Impact

- **Database**: Add `price`, `currency`, `paymentProvider`, `stripeAccountId`, `razorpayKeyId` to `Event`/`Organization`, and `paymentStatus`, `paymentRef`, `paymentProof` to `Registration`.
- **Backend API**: New `PaymentsModule` with Stripe Connect OAuth endpoints, Razorpay SDK integration, and webhook handlers (`/api/webhooks/stripe`, `/api/webhooks/razorpay`).
- **Dashboard UI**: Portal tab for organziers to connect Stripe / Razorpay accounts and toggle accepted payment methods.
- **Widget Package**: Light script integration for Stripe.js / Razorpay Checkout inside Shadow DOM.
