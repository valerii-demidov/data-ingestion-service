import { Logger, Injectable, Scope, Inject } from '@nestjs/common';
import { INQUIRER } from '@nestjs/core';
import { als } from '../als';

@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger extends Logger {
  constructor(@Inject(INQUIRER) private readonly host: object) {
    super(host?.constructor?.name ?? 'App');
  }

  private prefix(): string {
    const store = als.getStore();
    const traceId = store?.get('traceId');
    return traceId ? `[traceId=${traceId}]` : '';
  }

  log(message: string) {
    super.log(`${this.prefix()} ${message}`);
  }

  error(message: string, trace?: string) {
    super.error(`${this.prefix()} ${message}`, trace);
  }

  warn(message: string) {
    super.warn(`${this.prefix()} ${message}`);
  }

  debug(message: string) {
    super.debug(`${this.prefix()} ${message}`);
  }
}
