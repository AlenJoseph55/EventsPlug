import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [EventsController],
  providers: [EventsService, PrismaService],
  exports: [EventsService],
})
export class EventsModule {}
