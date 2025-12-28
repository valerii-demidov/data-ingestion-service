import { Injectable } from '@nestjs/common';
import { IngestionMapperInterface } from '../../../contracts/ingestion/ingestion-mapper.interface';
import { PropertyRecord } from '../../../contracts/models/property-record.interface';
import { UnifiedRecordSourceEnum } from '../../../contracts/ingestion-models/unified-record-source.enum';

@Injectable()
export class Source2Mapper implements IngestionMapperInterface {
  map(raw: unknown): PropertyRecord | null {
    const data = raw as Record<string, unknown>;
    if (!data.id) return null;

    // Safely convert id to string
    const externalId =
      typeof data.id === 'string' || typeof data.id === 'number'
        ? String(data.id)
        : null;
    if (externalId == null) return null;

    const canonical: PropertyRecord = {
      source: UnifiedRecordSourceEnum.source2,
      externalId,
      city: data.city as string | undefined,
      isAvailable: data.availability as boolean | undefined,
      pricePerNight: data.pricePerNight as number | undefined,
    };

    const extra: Record<string, unknown> = {};
    const canonicalFields = new Set([
      'id',
      'city',
      'availability',
      'pricePerNight',
    ]);

    for (const [key, value] of Object.entries(data)) {
      if (!canonicalFields.has(key) && value !== undefined && value !== null) {
        extra[key] = value;
      }
    }

    // priceSegment is now in extra (it's source-specific, not canonical)
    if (data.priceSegment !== undefined && data.priceSegment !== null) {
      extra.priceSegment = data.priceSegment;
    }

    if (Object.keys(extra).length > 0) {
      canonical.extra = extra;
    }

    return canonical;
  }
}
