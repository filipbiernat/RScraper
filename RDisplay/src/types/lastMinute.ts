export interface LastMinuteEntry {
  country: string;
  trip: string;
  airport: string;
  persons: number;
  dateRange: string;
  departureDate: string;
  returnDate: string;
  daysUntilDeparture: number;
  tripLengthDays: number;
  currentPrice: number;
  previousPrice: number | null;
  offerUrl: string;
  csvFileName: string;
  isDeal: boolean;
  dealReason: string | null;
  dealScore: number | null;
}

export interface LastMinuteData {
  generatedAt: string;
  maxWindowDays: number;
  entries: LastMinuteEntry[];
}