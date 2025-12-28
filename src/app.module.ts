import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DatabaseModule } from './infra/database/database.module';
import { PropertiesStorageModule } from './infra/storage/properties-storage/properties-storage.module';
import { DataIngestionModule } from './application/data-ingestion/data-ingestion.module';
import { DataQueryModule } from './application/data-query/data-query.module';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [
    DatabaseModule,
    PropertiesStorageModule,
    DataIngestionModule,
    DataQueryModule,
    LoggerModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
