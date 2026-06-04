import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RegistrationsController } from './registrations.controller';
import { RegistrationsService } from './registrations.service';

@Module({
  controllers: [RegistrationsController],
  providers: [RegistrationsService, PrismaService],
  exports: [RegistrationsService],
})
export class RegistrationsModule {}
