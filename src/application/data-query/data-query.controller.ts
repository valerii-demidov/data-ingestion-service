import { Controller, Get, Query, Req } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { DataQueryService } from './data-query.service';
import { ExtraFiltersParserService } from './services/extra-filters-parser.service';
import { SearchPropertiesDto } from './dto/search-properties.dto';
import { PropertyRecordResponse } from './responses/property-record.response';

@ApiTags('properties')
@ApiExtraModels(SearchPropertiesDto)
@Controller('properties')
export class DataQueryController {
  constructor(
    private readonly queryService: DataQueryService,
    private readonly extraFiltersParser: ExtraFiltersParserService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Search properties',
    description: `Search properties using canonical fields or source-specific fields via extra.* prefix. All fields are optional.

**Canonical fields:** city, isAvailable, priceMin, priceMax, limit, offset

**Extra fields:** Use \`extra.fieldName=value\` format to filter by source-specific fields that are stored in the \`extra\` object. 

**Common extra fields:**
- \`extra.name\` - Property name (source1 only)
- \`extra.country\` - Country (source1 only)
- \`extra.priceSegment\` - Price segment (source2 only). Possible values: \`"low"\`, \`"medium"\`, \`"high"\`

**Price Segment Values:**
- \`"low"\` - Low price segment properties
- \`"medium"\` - Medium price segment properties
- \`"high"\` - High price segment properties

**Multiple extra filters:** You can combine multiple extra filters by adding multiple query parameters:
- Single: \`/properties?extra.country=Japan\`
- Multiple: \`/properties?extra.name=Lakeview&extra.country=Australia&extra.priceSegment=medium\``,
  })
  @ApiQuery({
    name: 'extra.*',
    required: false,
    description: `Filter by source-specific fields stored in extra object. Format: extra.fieldName=value. 

Common fields:
- extra.name - Property name (source1 only), e.g., extra.name=Lakeview
- extra.country - Country (source1 only), e.g., extra.country=Australia
- extra.priceSegment - Price segment (source2 only), values: "low", "medium", "high", e.g., extra.priceSegment=medium

You can use multiple extra filters by repeating this parameter: extra.name=Lakeview&extra.country=Australia&extra.priceSegment=medium`,
    example: 'extra.name=Lakeview',
    isArray: false,
  })
  @ApiOkResponse({
    type: [PropertyRecordResponse],
    description: 'Matching properties',
  })
  async search(
    @Query() query: SearchPropertiesDto,
    @Req() req: Request,
  ): Promise<PropertyRecordResponse[]> {
    const extraFilters = this.extraFiltersParser.parseFromRequest(req);
    return this.queryService.find(query, extraFilters);
  }
}
