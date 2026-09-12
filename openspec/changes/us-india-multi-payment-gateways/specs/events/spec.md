# Events Delta Specification

## ADDED Requirements

### Requirement: Ticket Pricing & Gateway Configuration
The system SHALL allow organizers to set a ticket price, currency (`USD` or `INR`), and configure payment gateway options (`STRIPE`, `RAZORPAY`, `MANUAL_UPI`, or `NONE`) for an event.

#### Scenario: Create Paid Event with USD Pricing
- **WHEN** an organizer creates an event with price `$15.00` and currency `USD`
- **THEN** the event is stored with price in cents (1500) and currency `USD` requiring Stripe Connect

#### Scenario: Create Paid Event with INR UPI Pricing
- **WHEN** an organizer creates an event with price `₹500` and currency `INR` selecting Razorpay or Manual UPI
- **THEN** the event is stored with price in paisa (50000) and currency `INR` enabling Indian payment options
