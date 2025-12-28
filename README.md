# Property Data Service

NestJS backend that ingests property data from multiple JSON sources into a unified model and exposes a search API.

## Quick Start

### Docker 

```bash
  docker compose up --build
```

**Rebuild commands:**

```bash
    docker compose down && docker rmi data-ingestion-service-app && docker compose up --build
```

- **API**: http://localhost:3333
- **Swagger**: http://localhost:3333/api

## API Endpoints

### POST /ingest

⚠️ **Testing Only** - Triggers data ingestion from all configured sources. This operation may take 1-5 minutes to complete depending on data size.

**Warning:** This endpoint is intended for **testing purposes only**. In production, ingestion should be triggered via scheduled jobs or event-driven mechanisms.

```bash
  curl -X POST http://localhost:3333/ingest
```
**Response time:** Typically 1-5 minutes depending on data size and network speed.

### GET /properties

Search properties with optional filters. Supports both **canonical fields** and **source-specific fields** via `extra.*` prefix.

**Canonical Fields** (work across all sources):
```bash
  curl -X "GET" "http://localhost:3333/properties?city=Berlin&priceMin=100&priceMax=500"
  curl -X "GET" "http://localhost:3333/properties?isAvailable=true&limit=20&offset=0"
```

**Extra Fields** (source-specific, stored in `extra` object):
```bash
  # Combine canonical and extra filters
  curl -X "GET" "http://localhost:3333/properties?city=Paris&extra.name=Apartment&extra.country=France&isAvailable=true"

  # Multiple extra filters (if available)
  curl -X "GET" "http://localhost:3333/properties?extra.name=Cozy&extra.country=Japan&extra.priceSegment=medium"
```

**Canonical Query Parameters:**
- `city` - Partial text search in city (both sources)
- `isAvailable` - Boolean filter (true/false, both sources)
- `priceMin` / `priceMax` - Price range filter (numbers, both sources)
- `limit` - Results limit (default: 100, max: 1000)
- `offset` - Pagination offset (default: 0)

**Extra Fields Usage:**

Extra fields are source-specific fields that don't map to canonical fields. They are stored in the `extra` object and can be filtered using the `extra.fieldName=value` format.

**Common extra fields:**
- `extra.name` - Property name (source1 only)
- `extra.country` - Country (source1 only)
- `extra.priceSegment` - Price segment (source2 only). Possible values: `"low"`, `"medium"`, `"high"`

**Price Segment Values:**
- `"low"` - Low price segment
- `"medium"` - Medium price segment
- `"high"` - High price segment

## Adding New Sources

1. Create mapper in `application/data-ingestion/mappers/` implementing `IngestionMapperInterface`
2. Map source fields to canonical fields where semantics match
3. Put unmapped fields into `extra` object
4. Add source config in `ingestion-sources.config.ts`
5. Register mapper in `DataIngestionModule`

Source-specific fields are automatically searchable via `extra.*` prefix, no code changes needed.

## Adding New Canonical Fields

When multiple sources share a field with the same meaning, make it canonical:

1. Add field to `PropertyRecord` interface in `contracts/models/property-record.interface.ts`
2. Update all mappers where the field exists to map source-specific field → canonical field
3. Add field to `SearchPropertiesDto` if searchable
4. Update `PropertyRecordResponse` for Swagger
5. Add index in schema if frequent filtering is expected

## Adding Fields to Extra

If a field exists only in one source or has source-specific semantics, store it in `extra`:

1. Update mapper to put the field in `extra` object
2. Field becomes automatically searchable via `extra.fieldName` without code changes
3. Add example to README and Swagger documentation

**Example:** `priceSegment` is stored in `extra.priceSegment` because it only exists in source2 and has source-specific meaning.
