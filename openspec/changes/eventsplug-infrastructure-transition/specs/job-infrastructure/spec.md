## ADDED Requirements

### Requirement: BullMQ Queue Module
The system SHALL provide a shared NestJS module that initializes BullMQ with a Redis connection. All async job queues (email, webhooks) SHALL be registered through this module.

#### Scenario: Redis connection initialized
- **WHEN** the NestJS application boots
- **THEN** BullMQ connects to Redis using `REDIS_URL` from environment and all registered queues are ready to accept jobs

#### Scenario: Redis unavailable on boot
- **WHEN** Redis is not reachable at startup
- **THEN** the application logs a critical error and exits (fail-fast); HTTP endpoints are not available until the queue infrastructure is healthy

### Requirement: Email Notifications Queue
The system SHALL maintain a BullMQ queue named `email-notifications` for async transactional email delivery via Resend.

#### Scenario: Job enqueued and processed
- **WHEN** a job is added to the `email-notifications` queue
- **THEN** a worker picks it up and calls the Resend API; on success the job is marked complete

#### Scenario: Resend API failure triggers retry
- **WHEN** the Resend API returns an error
- **THEN** BullMQ retries the job up to 3 times with exponential backoff before moving to dead-letter

### Requirement: Webhook Delivery Queue
The system SHALL maintain a BullMQ queue named `webhook-delivery` for async signed webhook delivery with exponential retry.

#### Scenario: Delivery job processed
- **WHEN** a job is added to the `webhook-delivery` queue
- **THEN** a worker makes an HTTPS POST to the target URL with the signed envelope payload within 30 seconds

#### Scenario: In-process workers
- **WHEN** the NestJS application is running
- **THEN** BullMQ workers for both queues run within the same process (no separate worker service required in V1)
