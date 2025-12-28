import { AsyncLocalStorage } from 'async_hooks';

export type RequestContext = Map<'traceId' | 'taskId', string>;

export const als = new AsyncLocalStorage<RequestContext>();
