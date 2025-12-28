import { PropertyRecord } from '../models/property-record.interface';

export interface SearchFilters {
  city?: { $regex: string; $options: string };
  isAvailable?: boolean;
  pricePerNight?: {
    $gte?: number;
    $lte?: number;
  };
  [key: string]: unknown; // For extra.* filters
}

export interface PaginationOptions {
  limit: number;
  offset: number;
}

export interface PropertyRecordRepository {
  /**
   * Search properties with filters and pagination
   */
  find(
    filters: SearchFilters,
    pagination: PaginationOptions,
  ): Promise<PropertyRecord[]>;

  /**
   * Upsert multiple records in batch
   */
  upsertMany(records: PropertyRecord[]): Promise<number>;
}
