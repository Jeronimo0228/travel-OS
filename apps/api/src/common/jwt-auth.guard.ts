import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { AuthenticatedUser } from './authenticated-user.interface';
import { assertDemoCanWrite } from './demo-readonly';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ok = (await super.canActivate(context)) as boolean;
    if (!ok) return ok;
    const req = context.switchToHttp().getRequest<{
      user?: AuthenticatedUser;
      method: string;
      originalUrl?: string;
      url: string;
    }>();
    assertDemoCanWrite(req.user?.agencyId, req.method, req.originalUrl ?? req.url);
    return true;
  }
}
