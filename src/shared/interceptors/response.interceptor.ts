import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
  StreamableFile,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface Response {
  statusCode: number;
  message: string;
  data: any;
}

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response> {
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => {
        const status = response.statusCode;
        if (status >= 300 && status < 400) return data;

        if (data instanceof StreamableFile) {
          return data;
        }

        return {
          statusCode: status,
          message: 'Success',
          data: data || {},
        };
      }),
      catchError((err) => {
        if (err instanceof HttpException) {
          let fullRes = err.getResponse();

          if (typeof fullRes === 'object' && fullRes['code']) {
            fullRes = fullRes['error'];
          }
          const res = {
            statusCode: err.getStatus(),
            message: 'failed',
            error: fullRes,
          };
          throw new HttpException(res, res.statusCode);
        }
        throw err;
      }),
    );
  }
}
