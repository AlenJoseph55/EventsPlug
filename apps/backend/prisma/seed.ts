import { PrismaClient, FieldType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Seed global widget themes
  const themesData = [
    {
      slug: 'magic-adaptive',
      name: '🔮 Magic Adaptive',
      isPremium: false,
      price: 0,
      baseMode: 'auto',
      accentHue: 250,
      accentChroma: 0.18,
      surfaceTone: 'soft',
      skinId: 'frosted',
      fontPairingId: 'inter-inter',
    },
    {
      slug: 'midnight',
      name: 'Midnight',
      isPremium: false,
      price: 0,
      baseMode: 'dark',
      accentHue: 235,
      accentChroma: 0.20,
      surfaceTone: 'deep',
      skinId: 'frosted',
      fontPairingId: 'inter-inter',
    },
    {
      slug: 'light-minimal',
      name: 'Light Minimal',
      isPremium: false,
      price: 0,
      baseMode: 'light',
      accentHue: 220,
      accentChroma: 0.12,
      surfaceTone: 'soft',
      skinId: 'soft',
      fontPairingId: 'inter-inter',
    },
    {
      slug: 'neon-pulse',
      name: 'Neon Pulse',
      isPremium: false,
      price: 0,
      baseMode: 'dark',
      accentHue: 330,
      accentChroma: 0.28,
      surfaceTone: 'tinted',
      skinId: 'retro',
      fontPairingId: 'fira-inter',
    },
  ];

  console.log('Cleaning existing themes...');
  await prisma.widgetTheme.deleteMany({
    where: {
      slug: {
        notIn: ['magic-adaptive', 'midnight', 'light-minimal', 'neon-pulse'],
      },
    },
  });

  console.log('Seeding global widget themes...');
  for (const t of themesData) {
    const theme = await prisma.widgetTheme.upsert({
      where: { slug: t.slug },
      update: {
        name: t.name,
        isPremium: t.isPremium,
        price: t.price,
        baseMode: t.baseMode,
        accentHue: t.accentHue,
        accentChroma: t.accentChroma,
        surfaceTone: t.surfaceTone,
        skinId: t.skinId,
        fontPairingId: t.fontPairingId,
      },
      create: {
        slug: t.slug,
        name: t.name,
        isPremium: t.isPremium,
        price: t.price,
        baseMode: t.baseMode,
        accentHue: t.accentHue,
        accentChroma: t.accentChroma,
        surfaceTone: t.surfaceTone,
        skinId: t.skinId,
        fontPairingId: t.fontPairingId,
      },
    });
    console.log(`Theme seeded: ${theme.name} (${theme.slug})`);
  }

  // 2. Seed global widget skins
  const skinsData = [
    {
      slug: 'frosted',
      name: 'Frosted Glass',
      borderRadius: '16px',
      borderStyle: 'solid',
      borderWidth: '1px',
      shadowStyle: 'frosted',
      fontFamily: 'var(--font-sans)',
      backdropStyle: 'AURORA_GLOW',
    },
    {
      slug: 'sharp',
      name: 'Brutalist Bold',
      borderRadius: '0px',
      borderStyle: 'solid',
      borderWidth: '2.5px',
      shadowStyle: 'brutalist',
      fontFamily: 'var(--font-display)',
      backdropStyle: 'DOT_MATRIX',
    },
    {
      slug: 'soft',
      name: 'Minimalist Soft',
      borderRadius: '24px',
      borderStyle: 'none',
      borderWidth: '0px',
      shadowStyle: 'soft',
      fontFamily: 'var(--font-sans)',
      backdropStyle: 'AURORA_GLOW',
    },
    {
      slug: 'retro',
      name: 'Retro Cyber',
      borderRadius: '4px',
      borderStyle: 'solid',
      borderWidth: '1px',
      shadowStyle: 'glow',
      fontFamily: 'var(--font-mono)',
      backdropStyle: 'GRID_WARP',
    },
  ];

  console.log('Cleaning existing skins...');
  await prisma.widgetSkin.deleteMany({
    where: {
      slug: {
        notIn: ['frosted', 'sharp', 'soft', 'retro'],
      },
    },
  });

  console.log('Seeding global widget skins...');
  for (const s of skinsData) {
    const skin = await prisma.widgetSkin.upsert({
      where: { slug: s.slug },
      update: {
        name: s.name,
        borderRadius: s.borderRadius,
        borderStyle: s.borderStyle,
        borderWidth: s.borderWidth,
        shadowStyle: s.shadowStyle,
        fontFamily: s.fontFamily,
        backdropStyle: s.backdropStyle,
      },
      create: {
        slug: s.slug,
        name: s.name,
        borderRadius: s.borderRadius,
        borderStyle: s.borderStyle,
        borderWidth: s.borderWidth,
        shadowStyle: s.shadowStyle,
        fontFamily: s.fontFamily,
        backdropStyle: s.backdropStyle,
      },
    });
    console.log(`Skin seeded: ${skin.name} (${skin.slug})`);
  }

  // Get defaults to link to organization
  const defaultTheme = await prisma.widgetTheme.findUnique({ where: { slug: 'magic-adaptive' } });
  const defaultSkin = await prisma.widgetSkin.findUnique({ where: { slug: 'frosted' } });

  // 3. Create default organization
  const org = await prisma.organization.upsert({
    where: { slug: 'hash2025' },
    update: {
      defaultThemeId: defaultTheme?.id,
      hubThemeId: defaultTheme?.id,
      hubSkinId: defaultSkin?.id,
    },
    create: {
      slug: 'hash2025',
      name: 'Hash College Community',
      logoUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=200&q=80',
      defaultThemeId: defaultTheme?.id,
      hubThemeId: defaultTheme?.id,
      hubSkinId: defaultSkin?.id,
    },
  });
  console.log(`Organization created/found: ${org.name} (${org.slug})`);

  // 3b. Create system operators organization
  const systemOrg = await prisma.organization.upsert({
    where: { slug: 'system' },
    update: {
      defaultThemeId: defaultTheme?.id,
      hubThemeId: defaultTheme?.id,
      hubSkinId: defaultSkin?.id,
    },
    create: {
      slug: 'system',
      name: 'System Operators',
      logoUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=200&q=80',
      defaultThemeId: defaultTheme?.id,
      hubThemeId: defaultTheme?.id,
      hubSkinId: defaultSkin?.id,
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
