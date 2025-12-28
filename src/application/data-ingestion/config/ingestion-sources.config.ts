import { IngestionSourceConfig } from '../../../contracts/ingestion/ingestion-source-config.interface';
import { UnifiedRecordSourceEnum } from '../../../contracts/ingestion-models/unified-record-source.enum';

export const INGESTION_SOURCES_CONFIG: IngestionSourceConfig[] = [
  {
    source: UnifiedRecordSourceEnum.source1,
    name: 'Source1',
    url: 'https://buenro-tech-assessment-materials.s3.eu-north-1.amazonaws.com/structured_generated_data.json',
    enabled: true,
  },
  {
    source: UnifiedRecordSourceEnum.source2,
    name: 'Source2',
    url: 'https://buenro-tech-assessment-materials.s3.eu-north-1.amazonaws.com/large_generated_data.json',
    enabled: true,
  },
];
