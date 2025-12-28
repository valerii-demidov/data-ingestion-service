import { Module } from '@nestjs/common';
import { PropertiesStorageModule } from '../../infra/storage/properties-storage/properties-storage.module';
import { Source1Mapper } from './mappers/source1.mapper';
import { Source2Mapper } from './mappers/source2.mapper';
import { DataIngestionService } from './data-ingestion.service';
import { DataIngestionController } from './data-ingestion.controller';

@Module({
  imports: [PropertiesStorageModule],
  controllers: [DataIngestionController],
  providers: [DataIngestionService, Source1Mapper, Source2Mapper],
  exports: [DataIngestionService],
})
export class DataIngestionModule {}
