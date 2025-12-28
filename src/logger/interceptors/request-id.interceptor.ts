import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { als, RequestContext } from '../als';
import { AppLogger } from '../services/app-logger.service';

@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const traceId = randomUUID();
    const store: RequestContext = new Map();
    store.set('traceId', traceId);

    const req = context.switchToHttp().getRequest<Request>();
    const method = req.method;
    const url = req.url;

    return als.run(store, () => {
      this.logger.log(`→ ${method} ${url}`);

      const start = Date.now();
      return next.handle().pipe(
        tap(() => {
          als.run(store, () => {
            this.logger.log(`← ${method} ${url} ${Date.now() - start}ms`);
          });
        }),
      );
    });
  }
}
