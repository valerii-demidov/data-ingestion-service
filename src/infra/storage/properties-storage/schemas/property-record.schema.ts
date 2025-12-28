import { Schema } from 'mongoose';
import { PropertyRecord } from '../../../../contracts/models/property-record.interface';

export const PropertyRecordSchema = new Schema<PropertyRecord>(
  {
    source: { type: String, required: true, index: true },
    externalId: { type: String, required: true, index: true },
  },
  { strict: false, timestamps: true, collection: 'property_records' },
);

PropertyRecordSchema.index({ source: 1, externalId: 1 }, { unique: true });
PropertyRecordSchema.index({ city: 1 });
PropertyRecordSchema.index({ pricePerNight: 1 });
PropertyRecordSchema.index({ isAvailable: 1 });
