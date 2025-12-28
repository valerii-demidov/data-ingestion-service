import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PropertyRecordSchema } from './schemas/property-record.schema';
import { MongoPropertyRecordRepository } from './repositories/mongo-property-record.repository';
import { PROPERTY_RECORD_REPOSITORY_TOKEN } from '../../../contracts/repositories/property-record.repository.token';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'PropertyRecord', schema: PropertyRecordSchema },
    ]),
  ],
  providers: [
    {
      provide: PROPERTY_RECORD_REPOSITORY_TOKEN,
      useClass: MongoPropertyRecordRepository,
    },
  ],
  exports: [PROPERTY_RECORD_REPOSITORY_TOKEN],
})
export class PropertiesStorageModule {}
