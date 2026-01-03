import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class IglesiaContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();

    if (!req.user || !req.body) {
      return next.handle();
    }

    // CASO 1: body con miembros (CreateFamiliasDto)
    if (Array.isArray(req.body.miembros)) {
      req.body.miembros = req.body.miembros.map((m) => ({
        ...m,
        iglesiaId: m.iglesiaId ?? req.user.iglesiaId,
      }));
    }
    // CASO 2: body SIN miembros (otros endpoints)
    else if (!req.body.iglesiaId) {
      req.body.iglesiaId = req.user.iglesiaId;
    }

    return next.handle();
  }
}
