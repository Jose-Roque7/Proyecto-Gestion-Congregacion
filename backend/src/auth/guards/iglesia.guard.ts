import { CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

export class IglesiaGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();

    const userIglesiaId = req.user.iglesiaId;
    const iglesiaIdParam = req.params.iglesiaId;

    if (userIglesiaId !== iglesiaIdParam) {
      throw new ForbiddenException('No perteneces a esta iglesia');
    }

    return true;
  }
}
