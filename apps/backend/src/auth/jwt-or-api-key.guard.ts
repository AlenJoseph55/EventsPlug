import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiKeysService } from '../api-keys/api-keys.service';
import { UserRole } from '@eventflow/types';

@Injectable()
export class JwtOrApiKeyGuard implements CanActivate {
  private jwtGuard = new (AuthGuard('jwt'))();

  constructor(private readonly apiKeysService: ApiKeysService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers['authorization'];
    const apiKeyHeader = req.headers['x-api-key'] || req.headers['X-API-KEY'];

    // 1. If JWT Bearer token exists, try JWT first
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const canPass = await (this.jwtGuard.canActivate(context) as Promise<boolean>);
        if (canPass) {
          return true;
        }
      } catch (err) {
        // If API key is not present, rethrow JWT error
        if (!apiKeyHeader) {
          throw err;
        }
      }
    }

    // 2. Fall back to X-API-Key
    if (apiKeyHeader && typeof apiKeyHeader === 'string') {
      const orgId = await this.apiKeysService.validateKey(apiKeyHeader);
      if (!orgId) {
        throw new UnauthorizedException('Invalid or revoked API key');
      }

      req.user = {
        organizationId: orgId,
        role: UserRole.ADMIN,
      };
      return true;
    }

    throw new UnauthorizedException(
      'Authentication required. Please provide a Bearer JWT or X-API-Key header.',
    );
  }
}
