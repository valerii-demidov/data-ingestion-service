import { PropertyRecord } from '../models/property-record.interface';

export interface IngestionMapperInterface<TRaw = unknown> {
  map(raw: TRaw): PropertyRecord | null;
}
