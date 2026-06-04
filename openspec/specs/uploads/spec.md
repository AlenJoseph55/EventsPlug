## Purpose
Defines the specifications for event poster image uploads, validation constraints (formats and sizes), storage, and access authorization.

## Requirements

### Requirement: Image File Uploads
The system SHALL allow authenticated organizers to upload event poster images, restricted to supported formats and a maximum file size of 5MB.

#### Scenario: Successful Upload
- **WHEN** an organizer uploads an image in a supported format (jpg, jpeg, png, webp) that is 5MB or smaller
- **THEN** the image is stored in the local upload directory and its accessible URL is returned

#### Scenario: Reject Unsupported Format
- **WHEN** an organizer uploads a file with an unsupported extension (e.g. pdf, txt, exe)
- **THEN** a bad request exception is thrown stating "Only image files (jpg, jpeg, png, webp) are allowed!"

#### Scenario: Reject Large File
- **WHEN** an organizer uploads an image file larger than 5MB
- **THEN** a bad request exception is thrown and the file is rejected

#### Scenario: Unauthorized Upload
- **WHEN** an unauthenticated client requests the upload endpoint
- **THEN** the request is rejected with a 401 Unauthorized status
