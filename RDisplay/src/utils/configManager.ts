/**
 * Configuration manager for RScraper - TypeScript port of Python config_manager.py
 * Handles sources.json processing and URL building
 */

import type { SourcesConfig, TripConfig } from '../types/sources';

export class ConfigManager {
  private sourcesConfig: SourcesConfig | null = null;

  /**
   * Convert Polish characters to ASCII equivalents and replace spaces with underscores
   */
  private transliteratePolish(text: string): string {
    const polishChars: Record<string, string> = {
      'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n',
      'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
      'Ą': 'A', 'Ć': 'C', 'Ę': 'E', 'Ł': 'L', 'Ń': 'N',
      'Ó': 'O', 'Ś': 'S', 'Ź': 'Z', 'Ż': 'Z'
    };

    let result = text;
    for (const [polish, ascii] of Object.entries(polishChars)) {
      result = result.replace(new RegExp(polish, 'g'), ascii);
    }

    // Replace spaces with underscores
    result = result.replace(/ /g, '_');

    return result;
  }

  /**
   * Generate age parameters for URL based on person count
   */
  private generateAgeParams(personCount: number, ageParam: string): string {
    const params: string[] = [];
    for (let i = 0; i < personCount; i++) {
      params.push(`wiek=${ageParam}`);
    }
    return params.join('&');
  }

  /**
   * Build complete URL with all parameters - direct port from Python
   */
  private buildUrl(baseUrl: string, personCount: number, ageParam: string): string {
    const ageParams = this.generateAgeParams(personCount, ageParam);
    return `${baseUrl}?czyCenaZaWszystkich=1&${ageParams}&liczbaPokoi=1`;
  }

  /**
   * Parse CSV file name to extract trip information
   */
  private parseFileName(fileName: string): { country: string; tripName: string; departure: string; personCount: number } | null {
    // Remove .csv extension
    const baseName = fileName.replace('.csv', '');

    // Split by __ to get parts
    const parts = baseName.split('__');

    if (parts.length !== 4) {
      return null;
    }

    const [country, tripName, departure, personCountStr] = parts;

    // Extract person count from format like "1os" or "2os"
    const personCountMatch = personCountStr.match(/^(\d+)os$/);
    if (!personCountMatch) {
      console.log('❌ ConfigManager: Invalid person count format:', personCountStr);
      return null;
    }

    const personCount = parseInt(personCountMatch[1], 10);

    return {
      country,
      tripName,
      departure,
      personCount
    };
  }

  /**
   * Normalize string for comparison (handle both spaces and underscores)
   */
  private normalizeForComparison(text: string): string {
    return this.transliteratePolish(text).toLowerCase().replace(/[_\s]/g, '');
  }

  /**
   * Find matching trip in sources.json by comparing transliterated names
   */
  private findMatchingTrip(tripName: string): [string, TripConfig] | null {
    if (!this.sourcesConfig) {
      return null;
    }

    const normalizedTripName = this.normalizeForComparison(tripName);

    // Try exact match first
    for (const [key, config] of Object.entries(this.sourcesConfig.trips)) {
      const normalizedKey = this.normalizeForComparison(key);

      if (normalizedKey === normalizedTripName) {
        return [key, config];
      }
    }

    // Try partial match
    for (const [key, config] of Object.entries(this.sourcesConfig.trips)) {
      const normalizedKey = this.normalizeForComparison(key);
      if (normalizedKey.includes(normalizedTripName) || normalizedTripName.includes(normalizedKey)) {
        return [key, config];
      }
    }

    return null;
  }

  /**
   * Load sources configuration from GitHub
   */
  async loadSourcesConfig(): Promise<SourcesConfig> {
    try {
      const response = await fetch('https://raw.githubusercontent.com/filipbiernat/RScraper/master/sources.json');

      if (!response.ok) {
        throw new Error(`Failed to fetch sources.json: ${response.status} ${response.statusText}`);
      }

      const config = await response.json() as SourcesConfig;
      this.sourcesConfig = config;
      return config;
    } catch (error) {
      console.error('Error loading sources config:', error);
      throw error;
    }
  }

  /**
   * Build offer URL for a given CSV file name
   */
  async buildOfferUrl(fileName: string): Promise<string | null> {
    // Ensure sources config is loaded
    if (!this.sourcesConfig) {
      await this.loadSourcesConfig();
    }

    if (!this.sourcesConfig) {
      return null;
    }

    // Parse file name to extract trip info
    const tripInfo = this.parseFileName(fileName);

    if (!tripInfo) {
      return null;
    }

    // Find matching trip in sources.json
    const matchingTrip = this.findMatchingTrip(tripInfo.tripName);

    if (!matchingTrip) {
      return null;
    }

    const [, tripConfig] = matchingTrip;

    // Build URL using the same logic as Python
    const ageParam = this.sourcesConfig.global_config.age_param;
    const offerUrl = this.buildUrl(tripConfig.base_url, tripInfo.personCount, ageParam);

    return offerUrl;
  }
}

// Export singleton instance
export const configManager = new ConfigManager();