import { Module } from '@nestjs/common';
import { PropertiesStorageModule } from '../../infra/storage/properties-storage/properties-storage.module';
import { DataQueryController } from './data-query.controller';
import { DataQueryService } from './data-query.service';
import { ExtraFiltersParserService } from './services/extra-filters-parser.service';

@Module({
  imports: [PropertiesStorageModule],
  controllers: [DataQueryController],
  providers: [DataQueryService, ExtraFiltersParserService],
  exports: [DataQueryService],
})
export class DataQueryModule {}
