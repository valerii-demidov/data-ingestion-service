import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PropertyRecordResponse {
  @ApiProperty({ example: 'source1' })
  source: string;

  @ApiProperty({ example: '123456' })
  externalId: string;

  @ApiPropertyOptional({ example: 'Berlin' })
  city?: string;

  @ApiPropertyOptional({ example: true })
  isAvailable?: boolean;

  @ApiPropertyOptional({ example: 150 })
  pricePerNight?: number;

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: true,
    description: `Source-specific fields that do not map to canonical fields.

Common fields:
- name: string (source1 only) - Property name
- country: string (source1 only) - Country name
- priceSegment: "low" | "medium" | "high" (source2 only) - Price segment classification`,
    example: {
      name: 'Lakeview House',
      country: 'Australia',
      priceSegment: 'medium',
    },
  })
  extra?: Record<string, unknown>;
}
