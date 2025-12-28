import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DataIngestionService } from './data-ingestion.service';

@ApiTags('ingestion')
@Controller('ingest')
export class DataIngestionController {
  constructor(private readonly service: DataIngestionService) {}

  @Post()
  @ApiOperation({
    summary: 'Trigger data ingestion',
    description: `Triggers data ingestion from all configured sources. This endpoint may take several minutes to complete depending on data size.

**⚠️ Warning:** This endpoint is intended for testing purposes only. In production, ingestion should be triggered via scheduled jobs or event-driven mechanisms.

**Typical execution time:** 1-5 minutes depending on data size and network speed.`,
  })
  @ApiResponse({
    status: 200,
    description: 'Ingestion completed successfully',
    schema: {
      type: 'object',
      properties: {
        totalSources: { type: 'number', example: 2 },
        sourcesProcessed: { type: 'number', example: 2 },
        totalRecords: { type: 'number', example: 1000 },
        durationMs: { type: 'number', example: 45000 },
      },
    },
  })
  async ingest() {
    return this.service.ingestAll();
  }
}
