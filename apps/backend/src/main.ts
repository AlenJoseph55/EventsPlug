import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for dashboard and embeddable widget
  app.enableCors({
    origin: '*', // Allow all origins for the SaaS widget to work on any external site
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Ensure public/uploads directory exists for event posters
  const uploadsDir = join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(`Created uploads directory at: ${uploadsDir}`);
  }

  // Serve uploads statically
  app.use('/uploads', express.static(uploadsDir));
  console.log(`Serving static upload assets from: ${uploadsDir}`);

  const port = process.env.PORT || 5001;
  await app.listen(port);
  console.log(`EventsPlug Backend API running on: http://localhost:${port}`);
}
bootstrap();
