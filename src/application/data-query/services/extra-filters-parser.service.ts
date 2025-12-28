import { Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class ExtraFiltersParserService {
  /**
   * Extracts extra filters from request query parameters.
   * Handles both formats:
   * - Standard: extra.name=value&extra.country=value
   * - Swagger UI: extra.*=extra.name=value&extra.country=value
   */
  parseFromRequest(req: Request): Record<string, unknown> {
    const extraFilters: Record<string, unknown> = {};
    // ValidationPipe doesn't modify req.query, so we can use it directly
    const queryParams = req.query;

    for (const [key, value] of Object.entries(queryParams)) {
      if (key === 'extra.*') {
        this.parseSwaggerFormat(value, extraFilters);
      } else if (key.startsWith('extra.')) {
        this.parseStandardFormat(key, value, extraFilters);
      }
    }

    return extraFilters;
  }

  /**
   * Parses Swagger UI format: extra.*=extra.name=value&extra.country=value
   */
  private parseSwaggerFormat(
    value: unknown,
    extraFilters: Record<string, unknown>,
  ): void {
    const valueStr = String(value);

    if (valueStr.includes('&')) {
      // Multiple filters in one parameter
      const pairs = valueStr.split('&');
      for (const pair of pairs) {
        if (pair.startsWith('extra.')) {
          this.extractFieldValue(pair, extraFilters);
        }
      }
    } else if (valueStr.startsWith('extra.')) {
      // Single filter
      this.extractFieldValue(valueStr, extraFilters);
    }
  }

  /**
   * Parses standard format: extra.name=value
   */
  private parseStandardFormat(
    key: string,
    value: unknown,
    extraFilters: Record<string, unknown>,
  ): void {
    const fieldName = key.substring(6); // Remove 'extra.' prefix
    extraFilters[fieldName] = value;
  }

  /**
   * Extracts field name and value from format: extra.fieldName=value
   */
  private extractFieldValue(
    pair: string,
    extraFilters: Record<string, unknown>,
  ): void {
    const parts = pair.substring(6).split('=');
    if (parts.length >= 2) {
      const fieldName = parts[0];
      extraFilters[fieldName] = parts.slice(1).join('=');
    }
  }
}
