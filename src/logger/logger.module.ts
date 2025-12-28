import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppLogger } from './services/app-logger.service';
import { RequestIdInterceptor } from './interceptors/request-id.interceptor';

@Global()
@Module({
  providers: [
    AppLogger,
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestIdInterceptor,
    },
  ],
  exports: [AppLogger],
})
export class LoggerModule {}
