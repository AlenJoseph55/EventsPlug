import { PrismaClient, FieldType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create default organization
  const org = await prisma.organization.upsert({
    where: { slug: 'hash2025' },
    update: {},
    create: {
      slug: 'hash2025',
      name: 'Hash College Community',
      logoUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=200&q=80',
    },
  });
  console.log(`Organization created/found: ${org.name} (${org.slug})`);

  // 1b. Create system operators organization
  const systemOrg = await prisma.organization.upsert({
    where: { slug: 'system' },
    update: {},
    create: {
      slug: 'system',
      name: 'System Operators',
      logoUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=200&q=80',
    },
  });
  console.log(`System Organization created/found: ${systemOrg.name} (${systemOrg.slug})`);

  // 2. Create default organizer user
  const passwordHash = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'organizer@hash.edu' },
    update: { passwordHash, role: 'ADMIN' },
    create: {
      email: 'organizer@hash.edu',
      passwordHash,
      organizationId: org.id,
      role: 'ADMIN',
    },
  });
  console.log(`Admin user created/found: ${user.email}`);

  // 2b. Create default super-admin user
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@eventsplug.com' },
    update: { passwordHash: adminPasswordHash },
    create: {
      email: 'admin@eventsplug.com',
      passwordHash: adminPasswordHash,
      organizationId: systemOrg.id,
      role: 'SUPER_ADMIN',
    },
  });
  console.log(`Super Admin user created/found: ${superAdmin.email}`);

  // 3. Create events
  const nextMonth = new Date();
  nextMonth.setDate(nextMonth.getDate() + 30);

  // Mega Hackathon 2026
  await prisma.event.deleteMany({
    where: { organizationId: org.id, slug: 'mega-hackathon-2026' }
  });

  const event1 = await prisma.event.create({
    data: {
      organizationId: org.id,
      title: 'Mega Hackathon 2026',
      slug: 'mega-hackathon-2026',
      description: 'The biggest college hackathon of the year. Form teams, build amazing web/mobile products in 36 hours, and pitch to active VCs. Massive prize pool, free food, swag, and great mentorship!',
      date: nextMonth,
      location: 'Main Auditorium & Innovation Center',
      posterUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
      maxRegistrations: 150,
      accentColor: '#6366f1',
      formFields: {
        create: [
          { type: FieldType.TEXT, label: 'Full Name', placeholder: 'Enter your full name', required: true, order: 0 },
          { type: FieldType.EMAIL, label: 'Email Address', placeholder: 'you@example.com', required: true, order: 1 },
          { type: FieldType.TEXT, label: 'GitHub Profile URL', placeholder: 'https://github.com/username', required: true, order: 2 },
          { type: FieldType.SELECT, label: 'T-Shirt Size', placeholder: 'Select size', required: true, options: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']), order: 3 },
          { type: FieldType.TEXTAREA, label: 'Skills / Technical Stack', placeholder: 'React, Node, Python, etc.', required: false, order: 4 }
        ]
      }
    },
  });
  console.log(`Event created: ${event1.title}`);

  const twoWeeks = new Date();
  twoWeeks.setDate(twoWeeks.getDate() + 14);

  // Valorant Showdown
  await prisma.event.deleteMany({
    where: { organizationId: org.id, slug: 'valorant-showdown' }
  });

  const event2 = await prisma.event.create({
    data: {
      organizationId: org.id,
      title: 'Valorant Showdown',
      slug: 'valorant-showdown',
      description: 'Settle the scores in the ultimate gaming tournament! 5v5 tactical shooter action. Bring your premade squad or register as a free agent and we will draft you into a team. Live-streamed with commentary.',
      date: twoWeeks,
      location: 'Campus Gaming Lounge & Twitch',
      posterUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
      maxRegistrations: 32,
      accentColor: '#10b981',
      formFields: {
        create: [
          { type: FieldType.TEXT, label: 'In-Game Name (IGN) / Alias', placeholder: 'e.g., Faker, Shroud', required: true, order: 0 },
          { type: FieldType.EMAIL, label: 'Email Address', placeholder: 'you@example.com', required: true, order: 1 },
          { type: FieldType.TEXT, label: 'Discord Username / ID', placeholder: 'username or username#0000', required: true, order: 2 },
          { type: FieldType.SELECT, label: 'Gaming Platform', placeholder: 'Select Platform', required: true, options: JSON.stringify(['PC', 'Console', 'Mobile', 'Nintendo Switch']), order: 3 }
        ]
      }
    },
  });
  console.log(`Event created: ${event2.title}`);

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
