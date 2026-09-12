import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiKeysService } from '../api-keys/api-keys.service';
import { UserRole } from '@eventflow/types';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const apiKey = req.headers['x-api-key'] || req.headers['X-API-KEY'];

    if (!apiKey || typeof apiKey !== 'string') {
      throw new UnauthorizedException('Missing or invalid X-API-Key header');
    }

    const orgId = await this.apiKeysService.validateKey(apiKey);
    if (!orgId) {
      throw new UnauthorizedException('Invalid or revoked API key');
    }

    req.user = {
      organizationId: orgId,
      role: UserRole.ADMIN,
    };

    return true;
  }
}
