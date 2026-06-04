import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '@eventflow/types';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string) {
    return this.prisma.user.findMany({
      where: { organizationId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(
    organizationId: string,
    email: string,
    passwordPlain: string,
    role: UserRole,
  ) {
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      throw new ConflictException(
        'A user with this email address already exists.',
      );
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(passwordPlain, 10);

    const user = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        organizationId,
        role: role as any,
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return user;
  }

  async remove(
    organizationId: string,
    userIdToDelete: string,
    currentUserId: string,
  ) {
    if (userIdToDelete === currentUserId) {
      throw new BadRequestException('You cannot delete your own user account.');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        id: userIdToDelete,
        organizationId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found in your organization.');
    }

    await this.prisma.user.delete({
      where: { id: userIdToDelete },
    });

    return { success: true };
  }
}
