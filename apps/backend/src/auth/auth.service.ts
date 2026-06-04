import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: {
    email: string;
    passwordHash: string;
    organizationName: string;
    organizationSlug: string;
  }) {
    const email = dto.email.toLowerCase().trim();
    const slug = dto.organizationSlug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '');

    // Check if user email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException(
        'A user with this email address already exists.',
      );
    }

    // Check if organization slug already exists
    const existingOrg = await this.prisma.organization.findUnique({
      where: { slug },
    });
    if (existingOrg) {
      throw new ConflictException(
        'This organization URL slug is already taken.',
      );
    }

    // Hash the password
    const hashed = await bcrypt.hash(dto.passwordHash, 10);

    // Create organization and user in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          slug,
          name: dto.organizationName,
        },
      });

      const user = await tx.user.create({
        data: {
          email,
          passwordHash: hashed,
          organizationId: org.id,
          role: 'ADMIN',
        },
      });

      return { user, org };
    });

    const token = this.generateToken(result.user.id, result.user.email);

    return {
      token,
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
      },
      organization: {
        id: result.org.id,
        slug: result.org.slug,
        name: result.org.name,
      },
    };
  }

  async login(dto: { email: string; passwordHash: string }) {
    const email = dto.email.toLowerCase().trim();

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        organization: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordValid = await bcrypt.compare(
      dto.passwordHash,
      user.passwordHash,
    );
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.generateToken(user.id, user.email);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      organization: {
        id: user.organization.id,
        slug: user.organization.slug,
        name: user.organization.name,
      },
    };
  }

  private generateToken(userId: string, email: string): string {
    const payload = { sub: userId, email };
    return this.jwtService.sign(payload);
  }
}
