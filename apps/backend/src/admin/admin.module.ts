import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuthModule } from '../auth/auth.module';
import { TenantsController } from './tenants.controller';

@Module({
  imports: [AuthModule],
  controllers: [TenantsController],
  providers: [PrismaService],
})
export class AdminModule {}
