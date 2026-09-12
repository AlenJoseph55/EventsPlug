## Context

EventsPlug currently operates as a 100% free registration platform. Organizers in the US and India hosting paid workshops, ticketed meetups, or conferences require direct payment collection without platform escrow. This design outlines how we integrate Stripe Connect (for US/Global credit cards, Apple Pay, Google Pay) and Razorpay Route / API Keys (for Indian UPI apps like Google Pay, PhonePe, Paytm, and Indian Netbanking/Cards), alongside a zero-fee Manual UPI QR mode.

## Goals / Non-Goals

**Goals:**
- Enable direct money transfers into the organizer's own Stripe or Razorpay bank accounts.
- Support payment methods popular in the US (Credit Cards, Apple Pay, Google Pay) and India (UPI Apps, Netbanking, Cards, Manual QR).
- Provide a smooth payment checkout flow directly inside the `<events-plug-widget>` Shadow DOM and standalone `/e/[org]/[event]` page.
- Securely handle asynchronous payment webhooks from Stripe and Razorpay to mark registrations as `PAID`.

**Non-Goals:**
- Holding or escrowing attendee funds on EventsPlug servers.
- Complex multi-tiered seat ticketing inventory or seat mapping (keeping the platform ultra-lightweight).

## Decisions

### Decision 1: Stripe Connect Direct Charges for US & Global
- **Approach**: Organizers authorize their Stripe account via OAuth Connect in the dashboard.
- **Rationale**: Direct Charges (`transfer_data.destination = stripeAccountId`) send 100% of the funds directly to the organizer's bank account. Refunds and chargebacks are handled natively in the organizer's Stripe Dashboard.
- **Alternatives Considered**: Platform Escrow (rejected: requires money transmitter compliance & heavy backend accounting).

### Decision 2: Razorpay API Key & Order API for India (UPI & Netbanking)
- **Approach**: Indian organizers enter their Razorpay `Key ID` and `Key Secret` (encrypted in DB) or use Razorpay Route.
- **Rationale**: Razorpay provides native Indian payment methods (UPI deep-linking for PhonePe/GooglePay/Paytm, UPI Intent, 50+ Indian Banks Netbanking).
- **Alternatives Considered**: Stripe India only (rejected: Stripe India lacks deep UPI app intent support compared to Razorpay).

### Decision 3: Zero-Fee Manual UPI QR & Reference ID Option
- **Approach**: Indian community organizers can provide their UPI VPA (`name@upi`) or upload a QR Code. Attendees scan and pay on their mobile app, then enter the 12-digit UTR transaction reference number when submitting the form.
- **Rationale**: Allows 100% zero-fee payments for grassroots community events without requiring a business payment gateway account.

### Decision 4: Shadow DOM Modal Checkout
- **Approach**: Widget dynamically loads lightweight Stripe Elements or Razorpay Checkout modal when a paid form is submitted.
- **Rationale**: Preserves shadow boundary and style isolation while executing PCI-compliant gateway iframe checkouts.

## Risks / Trade-offs

- **[Risk] Webhook Delivery Failure** → *Mitigation*: Fallback client polling endpoint (`GET /api/registrations/:id/status`) checks payment intent status directly with Stripe/Razorpay if webhooks are delayed.
- **[Risk] Currency Misconfiguration** → *Mitigation*: Strict currency validation (USD for Stripe, INR for Razorpay/UPI) to prevent conversion mismatches.
