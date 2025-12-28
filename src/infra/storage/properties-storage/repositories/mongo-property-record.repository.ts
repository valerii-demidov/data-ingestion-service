import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import {
  PropertyRecordRepository,
  SearchFilters,
  PaginationOptions,
} from '../../../../contracts/repositories/property-record.repository.interface';
import { PropertyRecord } from '../../../../contracts/models/property-record.interface';

@Injectable()
export class MongoPropertyRecordRepository implements PropertyRecordRepository {
  constructor(
    @InjectModel('PropertyRecord')
    private readonly model: Model<PropertyRecord>,
  ) {}

  async find(
    filters: SearchFilters,
    pagination: PaginationOptions,
  ): Promise<PropertyRecord[]> {
    const mongoFilter: FilterQuery<PropertyRecord> = filters;
    return this.model
      .find(mongoFilter)
      .limit(pagination.limit)
      .skip(pagination.offset)
      .lean()
      .exec();
  }

  async upsertMany(records: PropertyRecord[]): Promise<number> {
    if (!records.length) return 0;

    const ops = records.map((r) => ({
      updateOne: {
        filter: { source: r.source, externalId: r.externalId },
        update: { $set: r },
        upsert: true,
      },
    }));

    const result = await this.model.bulkWrite(ops, { ordered: false });
    return result.upsertedCount + result.modifiedCount;
  }
}
