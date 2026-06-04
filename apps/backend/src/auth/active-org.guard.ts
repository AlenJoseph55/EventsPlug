import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserRole, OrganizationStatus } from '@eventflow/types';

@Injectable()
export class ActiveOrgGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    // Super-admins bypass tenant suspension checks globally
    if (user.role === UserRole.SUPER_ADMIN) {
      return true;
    }

    const org = await this.prisma.organization.findUnique({
      where: { id: user.organizationId },
    });

    if (!org) {
      return false;
    }

    if (org.status === OrganizationStatus.SUSPENDED) {
      throw new ForbiddenException('This organization is currently suspended.');
    }

    return true;
  }
}
