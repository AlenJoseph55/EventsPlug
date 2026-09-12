export function renderConfirmationEmail(data: {
  eventTitle: string;
  eventDate?: string | null;
  eventLocation?: string | null;
  registrationId: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Registration Confirmed</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #09090b; color: #f4f4f5; margin: 0; padding: 40px 20px; }
    .card { max-width: 560px; margin: 0 auto; background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 32px; }
    .badge { display: inline-block; background: #22c55e20; color: #22c55e; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 16px; }
    h1 { font-size: 24px; font-weight: 700; color: #ffffff; margin: 0 0 8px 0; }
    p { font-size: 14px; line-height: 1.6; color: #a1a1aa; margin: 0 0 20px 0; }
    .details { background-color: #09090b; border: 1px solid #27272a; border-radius: 8px; padding: 20px; margin: 24px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #18181b; font-size: 14px; }
    .detail-row:last-child { border-bottom: none; }
    .label { color: #71717a; }
    .value { color: #ffffff; font-weight: 600; }
    .reg-id { font-family: monospace; color: #3b82f6; font-weight: 700; font-size: 15px; }
    .footer { text-align: center; margin-top: 32px; font-size: 12px; color: #52525b; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">Registration Confirmed</div>
    <h1>You're going to ${data.eventTitle}!</h1>
    <p>Your registration has been confirmed. Please keep your registration ID handy for check-in.</p>
    
    <div class="details">
      <div class="detail-row">
        <span class="label">Event</span>
        <span class="value">${data.eventTitle}</span>
      </div>
      ${data.eventDate ? `
      <div class="detail-row">
        <span class="label">Date & Time</span>
        <span class="value">${new Date(data.eventDate).toLocaleString()}</span>
      </div>` : ''}
      ${data.eventLocation ? `
      <div class="detail-row">
        <span class="label">Location</span>
        <span class="value">${data.eventLocation}</span>
      </div>` : ''}
      <div class="detail-row">
        <span class="label">Registration ID</span>
        <span class="reg-id">${data.registrationId}</span>
      </div>
    </div>

    <p style="font-size: 13px; color: #71717a;">If you need to make changes or cancel your registration, you can use your registration ID.</p>
  </div>
  <div class="footer">
    Powered by EventsPlug Event Registration Infrastructure
  </div>
</body>
</html>
  `.trim();
}

export function renderCancellationEmail(data: {
  eventTitle: string;
  registrationId: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Registration Cancelled</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #09090b; color: #f4f4f5; margin: 0; padding: 40px 20px; }
    .card { max-width: 560px; margin: 0 auto; background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 32px; }
    .badge { display: inline-block; background: #ef444420; color: #ef4444; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 16px; }
    h1 { font-size: 24px; font-weight: 700; color: #ffffff; margin: 0 0 8px 0; }
    p { font-size: 14px; line-height: 1.6; color: #a1a1aa; margin: 0 0 20px 0; }
    .reg-id { font-family: monospace; color: #ef4444; font-weight: 700; }
    .footer { text-align: center; margin-top: 32px; font-size: 12px; color: #52525b; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">Cancelled</div>
    <h1>Registration Cancelled</h1>
    <p>Your registration for <strong>${data.eventTitle}</strong> (<span class="reg-id">${data.registrationId}</span>) has been cancelled.</p>
    <p>If this was done in error or you wish to register again, please visit the event page.</p>
  </div>
  <div class="footer">
    Powered by EventsPlug Event Registration Infrastructure
  </div>
</body>
</html>
  `.trim();
}

export function renderOrganizerNotificationEmail(data: {
  eventTitle: string;
  registrationId: string;
  attendeeEmail: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Registration</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #09090b; color: #f4f4f5; margin: 0; padding: 40px 20px; }
    .card { max-width: 560px; margin: 0 auto; background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 32px; }
    h1 { font-size: 20px; font-weight: 700; color: #ffffff; margin: 0 0 8px 0; }
    p { font-size: 14px; line-height: 1.6; color: #a1a1aa; margin: 0 0 16px 0; }
    .details { background-color: #09090b; border: 1px solid #27272a; border-radius: 8px; padding: 16px; margin: 16px 0; font-size: 14px; }
    .footer { text-align: center; margin-top: 32px; font-size: 12px; color: #52525b; }
  </style>
</head>
<body>
  <div class="card">
    <h1>New attendee registered!</h1>
    <p>A new attendee just registered for <strong>${data.eventTitle}</strong>.</p>
    <div class="details">
      <div><strong>Email:</strong> ${data.attendeeEmail}</div>
      <div style="margin-top: 6px;"><strong>Registration ID:</strong> <code style="color: #3b82f6;">${data.registrationId}</code></div>
    </div>
  </div>
  <div class="footer">
    EventsPlug Organizer Alert
  </div>
</body>
</html>
  `.trim();
}
