export interface PropertyRecord {
  source: string;
  externalId: string;

  city?: string;
  isAvailable?: boolean;
  pricePerNight?: number;

  extra?: Record<string, unknown>;
}
