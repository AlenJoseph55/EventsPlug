import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class ApiKeysService {
  constructor(private readonly prisma: PrismaService) {}

  async create(organizationId: string, name: string) {
    // Generate 32 bytes of cryptographically secure random bytes
    const secret = crypto.randomBytes(24).toString('base64url');
    const rawKey = `ep_live_${secret}`;
    const keyPrefix = rawKey.substring(0, 16);
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

    const apiKey = await this.prisma.apiKey.create({
      data: {
        organizationId,
        name,
        keyPrefix,
        keyHash,
      },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        createdAt: true,
      },
    });

    // Return the rawKey only ONCE upon creation
    return {
      ...apiKey,
      rawKey,
    };
  }

  async list(organizationId: string) {
    return this.prisma.apiKey.findMany({
      where: {
        organizationId,
        revokedAt: null,
      },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        lastUsedAt: true,
        createdAt: true,
        revokedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async revoke(id: string, organizationId: string) {
    const key = await this.prisma.apiKey.findUnique({
      where: { id },
    });

    if (!key) {
      throw new NotFoundException('API key not found');
    }

    if (key.organizationId !== organizationId) {
      throw new ForbiddenException('You do not own this API key');
    }

    return this.prisma.apiKey.update({
      where: { id },
      data: { revokedAt: new Date() },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        revokedAt: true,
      },
    });
  }

  async validateKey(rawKey: string): Promise<string | null> {
    if (!rawKey || !rawKey.startsWith('ep_live_')) {
      return null;
    }

    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

    const apiKey = await this.prisma.apiKey.findUnique({
      where: { keyHash },
    });

    if (!apiKey || apiKey.revokedAt) {
      return null;
    }

    // Fire-and-forget update of lastUsedAt
    this.prisma.apiKey
      .update({
        where: { id: apiKey.id },
        data: { lastUsedAt: new Date() },
      })
      .catch(() => {});

    return apiKey.organizationId;
  }
}
