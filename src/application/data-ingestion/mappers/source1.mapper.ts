import { Injectable } from '@nestjs/common';
import { IngestionMapperInterface } from '../../../contracts/ingestion/ingestion-mapper.interface';
import { PropertyRecord } from '../../../contracts/models/property-record.interface';
import { UnifiedRecordSourceEnum } from '../../../contracts/ingestion-models/unified-record-source.enum';

@Injectable()
export class Source1Mapper implements IngestionMapperInterface {
  map(raw: unknown): PropertyRecord | null {
    const data = raw as Record<string, unknown>;
    if (data.id == null) return null;

    const address = data.address as Record<string, unknown> | undefined;

    // Safely convert id to string
    const externalId =
      typeof data.id === 'string' || typeof data.id === 'number'
        ? String(data.id)
        : null;
    if (externalId == null) return null;

    const canonical: PropertyRecord = {
      source: UnifiedRecordSourceEnum.source1,
      externalId,
      city: address?.city as string | undefined,
      isAvailable: data.isAvailable as boolean | undefined,
      pricePerNight: data.priceForNight as number | undefined,
    };

    const extra: Record<string, unknown> = {};
    const canonicalFields = new Set([
      'id',
      'address',
      'isAvailable',
      'priceForNight',
    ]);

    // Collect unmapped fields from root level (including name)
    for (const [key, value] of Object.entries(data)) {
      if (!canonicalFields.has(key) && value !== undefined && value !== null) {
        extra[key] = value;
      }
    }

    // Only add country from address to extra
    if (address?.country !== undefined && address?.country !== null) {
      extra.country = address.country;
    }

    if (Object.keys(extra).length > 0) {
      canonical.extra = extra;
    }

    return canonical;
  }
}
