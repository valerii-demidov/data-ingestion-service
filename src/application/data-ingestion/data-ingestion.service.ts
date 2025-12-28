import { Injectable, Inject } from '@nestjs/common';
import { Readable, pipeline } from 'stream';
import { promisify } from 'util';
import { parser } from 'stream-json';
import { streamArray } from 'stream-json/streamers/StreamArray';

import { AppLogger } from '../../logger/services/app-logger.service';
import { PropertyRecord } from '../../contracts/models/property-record.interface';
import { IngestionSourceConfig } from '../../contracts/ingestion/ingestion-source-config.interface';
import { IngestionMapperInterface } from '../../contracts/ingestion/ingestion-mapper.interface';
import { PropertyRecordRepository } from '../../contracts/repositories/property-record.repository.interface';
import { PROPERTY_RECORD_REPOSITORY_TOKEN } from '../../contracts/repositories/property-record.repository.token';
import { Source1Mapper } from './mappers/source1.mapper';
import { Source2Mapper } from './mappers/source2.mapper';
import { INGESTION_SOURCES_CONFIG } from './config/ingestion-sources.config';

const pipelineAsync = promisify(pipeline);
const BATCH_SIZE = 1000;

export interface IngestionResult {
  source: string;
  name: string;
  success: boolean;
  recordsProcessed: number;
  recordsSkipped: number;
  skippedReason?: string;
  error?: string;
  durationMs: number;
}

export interface IngestionRunResult {
  startedAt: Date;
  completedAt: Date;
  totalDurationMs: number;
  sources: IngestionResult[];
}

interface SourceMetadata {
  etag?: string;
  lastModified?: string;
}

@Injectable()
export class DataIngestionService {
  private readonly mappers: Map<string, IngestionMapperInterface>;
  private readonly sourceMetadata = new Map<string, SourceMetadata>();

  constructor(
    private readonly logger: AppLogger,
    @Inject(PROPERTY_RECORD_REPOSITORY_TOKEN)
    private readonly repository: PropertyRecordRepository,
    source1Mapper: Source1Mapper,
    source2Mapper: Source2Mapper,
  ) {
    this.mappers = new Map<string, IngestionMapperInterface>();
    this.mappers.set('source1', source1Mapper);
    this.mappers.set('source2', source2Mapper);
  }

  async ingestAll(): Promise<IngestionRunResult> {
    const startedAt = new Date();
    this.logger.log('Starting ingestion for all sources');

    const enabledSources = INGESTION_SOURCES_CONFIG.filter((s) => s.enabled);
    const results: IngestionResult[] = [];

    for (const config of enabledSources) {
      results.push(await this.ingestSource(config));
    }

    const completedAt = new Date();
    const totalDurationMs = completedAt.getTime() - startedAt.getTime();
    const totalProcessed = results.reduce(
      (sum, r) => sum + r.recordsProcessed,
      0,
    );

    this.logger.log(
      `Ingestion complete: ${totalProcessed} saved in ${totalDurationMs}ms`,
    );

    return { startedAt, completedAt, totalDurationMs, sources: results };
  }

  async ingestSource(config: IngestionSourceConfig): Promise<IngestionResult> {
    const startTime = Date.now();
    this.logger.log(`[${config.name}] Starting ingestion`);

    const mapper = this.mappers.get(config.source);
    if (!mapper) {
      return this.result(
        config,
        false,
        0,
        0,
        startTime,
        `No mapper for ${config.source}`,
      );
    }

    try {
      const metadata = await this.fetchMetadata(config.url);
      const cached = this.sourceMetadata.get(config.url);

      if (cached && metadata.etag && cached.etag === metadata.etag) {
        this.logger.log(`[${config.name}] No changes detected, skipping`);
        return this.result(
          config,
          true,
          0,
          0,
          startTime,
          undefined,
          'unchanged',
        );
      }

      this.logger.log(`[${config.name}] Fetching stream from ${config.url}`);
      const stream = await this.fetchStream(config.url);

      const { processed, skipped } = await this.processStream(
        stream,
        mapper,
        config.name,
      );

      this.sourceMetadata.set(config.url, metadata);

      this.logger.log(
        `[${config.name}] Complete: ${processed} saved, ${skipped} skipped`,
      );
      return this.result(config, true, processed, skipped, startTime);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`[${config.name}] Ingestion failed: ${msg}`);
      return this.result(config, false, 0, 0, startTime, msg);
    }
  }

  private async fetchMetadata(url: string): Promise<SourceMetadata> {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      return {
        etag: res.headers.get('etag') ?? undefined,
        lastModified: res.headers.get('last-modified') ?? undefined,
      };
    } catch (err) {
      this.logger.warn(
        `Failed to fetch metadata: ${err instanceof Error ? err.message : err}`,
      );
      return {};
    }
  }

  private async fetchStream(url: string): Promise<Readable> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    if (!response.body) {
      throw new Error('Empty response body');
    }
    return Readable.fromWeb(
      response.body as import('stream/web').ReadableStream,
    );
  }

  private async processStream(
    inputStream: Readable,
    mapper: IngestionMapperInterface,
    sourceName: string,
  ): Promise<{ processed: number; skipped: number }> {
    const batch: PropertyRecord[] = [];
    let skipped = 0;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const jsonParser = parser();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const arrayStreamer = streamArray();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    arrayStreamer.on('data', (chunk: { value: unknown }) => {
      const { value } = chunk;
      const record = mapper.map(value);
      if (record && record.source && record.externalId) {
        batch.push(record);
      } else {
        skipped++;
        if (skipped <= 5) {
          this.logger.warn(
            `[${sourceName}] Invalid record skipped: ${JSON.stringify(value).slice(0, 80)}`,
          );
        }
      }
    });

    try {
      await pipelineAsync(inputStream, jsonParser, arrayStreamer);
    } catch (err) {
      this.logger.error(
        `[${sourceName}] Stream parsing error: ${err instanceof Error ? err.message : err}`,
      );
      throw err;
    }

    this.logger.log(`[${sourceName}] Parsed ${batch.length} valid records`);

    let processed = 0;
    for (let i = 0; i < batch.length; i += BATCH_SIZE) {
      const slice = batch.slice(i, i + BATCH_SIZE);
      try {
        processed += await this.repository.upsertMany(slice);
      } catch (err) {
        this.logger.error(
          `[${sourceName}] Repository batch error: ${err instanceof Error ? err.message : err}`,
        );
        throw err;
      }
    }

    return { processed, skipped };
  }

  private result(
    config: IngestionSourceConfig,
    success: boolean,
    recordsProcessed: number,
    recordsSkipped: number,
    startTime: number,
    error?: string,
    skippedReason?: string,
  ): IngestionResult {
    return {
      source: config.source,
      name: config.name,
      success,
      recordsProcessed,
      recordsSkipped,
      skippedReason,
      error,
      durationMs: Date.now() - startTime,
    };
  }
}
