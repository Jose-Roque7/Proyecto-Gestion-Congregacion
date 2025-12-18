import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class IglesiaContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();

    if (req.user && req.body && !req.body.iglesiaId) {
      req.body.iglesiaId = req.user.iglesiaId;
    }

    return next.handle().pipe(map((data) => data));
  }
}
