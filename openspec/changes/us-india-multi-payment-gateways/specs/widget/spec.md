# Widget Delta Specification

## ADDED Requirements

### Requirement: Inline Payment Checkout in Shadow DOM
The widget SHALL render price breakdowns and launch PCI-compliant payment modal checkouts (Stripe Elements / Razorpay Checkout) when processing paid event forms.

#### Scenario: Display Ticket Price Header
- **WHEN** the `<events-plug-widget>` mounts for a paid event
- **THEN** it displays the ticket price (e.g. `$15.00` or `₹500`) alongside the event title

#### Scenario: Launch Payment Modal on Submit
- **WHEN** a user fills out form inputs and clicks "Pay & Confirm RSVP"
- **THEN** the widget validates inputs and launches the gateway payment modal inside or overlaying the Shadow DOM
