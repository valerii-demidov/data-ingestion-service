import { Injectable, Inject } from '@nestjs/common';
import { SearchPropertiesDto } from './dto/search-properties.dto';
import { PropertyRecord } from '../../contracts/models/property-record.interface';
import {
  PropertyRecordRepository,
  SearchFilters,
} from '../../contracts/repositories/property-record.repository.interface';
import { PROPERTY_RECORD_REPOSITORY_TOKEN } from '../../contracts/repositories/property-record.repository.token';

@Injectable()
export class DataQueryService {
  constructor(
    @Inject(PROPERTY_RECORD_REPOSITORY_TOKEN)
    private readonly repository: PropertyRecordRepository,
  ) {}

  async find(
    query: SearchPropertiesDto,
    extraFilters: Record<string, unknown>,
  ): Promise<PropertyRecord[]> {
    const filters = this.buildFilters(query, extraFilters);
    const pagination = {
      limit: query.limit ?? 100,
      offset: query.offset ?? 0,
    };

    return this.repository.find(filters, pagination);
  }

  private buildFilters(
    query: SearchPropertiesDto,
    extraFilters: Record<string, unknown>,
  ): SearchFilters {
    const filters: SearchFilters = {};

    this.applyCanonicalFilters(filters, query);
    this.applyExtraFilters(filters, extraFilters);

    return filters;
  }

  private applyCanonicalFilters(
    filters: SearchFilters,
    query: SearchPropertiesDto,
  ): void {
    if (query.city) {
      filters.city = { $regex: query.city, $options: 'i' };
    }

    if (query.isAvailable !== undefined) {
      filters.isAvailable = query.isAvailable;
    }

    if (query.priceMin !== undefined || query.priceMax !== undefined) {
      filters.pricePerNight = {};
      if (query.priceMin !== undefined) {
        filters.pricePerNight.$gte = query.priceMin;
      }
      if (query.priceMax !== undefined) {
        filters.pricePerNight.$lte = query.priceMax;
      }
    }
  }

  private applyExtraFilters(
    filters: SearchFilters,
    extraFilters: Record<string, unknown>,
  ): void {
    for (const [key, value] of Object.entries(extraFilters)) {
      if (value !== undefined && value !== null && value !== '') {
        filters[`extra.${key}`] =
          typeof value === 'string' ? { $regex: value, $options: 'i' } : value;
      }
    }
  }
}
