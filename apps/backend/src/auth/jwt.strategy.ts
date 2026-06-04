import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        process.env.JWT_SECRET || 'eventsplug-super-secret-key-change-in-prod',
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        organization: {
          select: {
            id: true,
            slug: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        'Invalid or expired authentication token',
      );
    }

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      organizationSlug: user.organization.slug,
      organizationName: user.organization.name,
    };
  }
}
