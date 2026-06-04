## 1. Database Schema Updates

- [x] 1.1 Add `hubAccentColor` and `hubBannerUrl` fields to the `Organization` model and remove `hubCss` in `prisma/schema.prisma`.
- [x] 1.2 Run Prisma migration via `npx prisma migrate dev` to update the local database.

## 2. Backend DTOs & Customization Endpoints

- [x] 2.1 Update validation DTOs in the NestJS preferences controller to validate `hubAccentColor` (regex matching valid Hex color codes) and accept `hubBannerUrl`.
- [x] 2.2 Modify organization customization methods in the backend service to save and retrieve the new fields.

## 3. Dashboard UI Visual Controls

- [x] 3.1 Replace the raw Custom CSS textarea in `portal/page.tsx` with an HTML brand accent color picker and a header cover banner upload component.
- [x] 3.2 Update the React helper states and payload bindings to send `hubAccentColor` and `hubBannerUrl` on save.

## 4. Standalone Public Hub Rendering

- [x] 4.1 Update `apps/dashboard/src/app/o/[orgSlug]/page.tsx` to fetch the new customization properties from the organization payload.
- [x] 4.2 Bind the custom accent color to CSS Custom Properties (e.g. `--primary-color`) dynamically, and render the banner cover image as a background container at the top of the hub.

## 5. Verification & Validation

- [x] 5.1 Validate specifications via `npx openspec validate --specs`.
- [x] 5.2 Run a full workspace compilation and type check via `pnpm build`.
