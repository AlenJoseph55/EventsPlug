# Payments Specification

## ADDED Requirements

### Requirement: Direct Multi-Gateway Payment Processing
The system SHALL process paid registrations using direct organizer payment gateways (Stripe Connect for US/Global, Razorpay for India UPI/Cards, and Manual UPI QR Code).

#### Scenario: Paid Registration via Stripe Connect (US)
- **WHEN** an attendee submits a paid registration for a USD event configured with Stripe Connect
- **THEN** the system creates a Stripe PaymentIntent with `transfer_data.destination` set to the organizer's Stripe Account ID and returns a client secret to launch Stripe Elements

#### Scenario: Paid Registration via Razorpay (India UPI / Netbanking / Cards)
- **WHEN** an attendee submits a paid registration for an INR event configured with Razorpay
- **THEN** the system creates a Razorpay Order using the organizer's credentials and returns the order ID to launch Razorpay Checkout

#### Scenario: Manual UPI QR Payment (Zero-Fee India)
- **WHEN** an attendee submits a registration for an INR event using Manual UPI QR mode
- **THEN** the system displays the organizer's UPI QR Code / VPA and records the registration with status `PENDING_PAYMENT` along with the attendee's 12-digit UTR transaction reference number

#### Scenario: Stripe Webhook Confirmation
- **WHEN** Stripe posts a `payment_intent.succeeded` webhook event
- **THEN** the system updates the corresponding registration status from `PENDING_PAYMENT` to `PAID`

#### Scenario: Razorpay Webhook Confirmation
- **WHEN** Razorpay posts a `payment.authorized` or `order.paid` webhook event
- **THEN** the system verifies the webhook signature and updates the corresponding registration status to `PAID`
