import React from 'react';
import {
  LocalOffer as LocalOfferIcon,
  Star as StarIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';

export type DealReason = 'priceDrop' | 'allTimeLow' | 'lowestPerTrip' | 'combined';

const countryFlags: Record<string, string> = {
  Hiszpania: '🇪🇸',
  Indie: '🇮🇳',
  Chiny: '🇨🇳',
  Tunezja: '🇹🇳',
  'Sri Lanka': '🇱🇰',
  'Korea Południowa': '🇰🇷',
  Japonia: '🇯🇵',
  Wietnam: '🇻🇳',
  Malezja: '🇲🇾',
  Meksyk: '🇲🇽',
  Kolumbia: '🇨🇴',
  Chile: '🇨🇱',
  Boliwia: '🇧🇴',
  Peru: '🇵🇪',
  Argentyna: '🇦🇷',
  Brazylia: '🇧🇷',
  Urugwaj: '🇺🇾',
  Paragwaj: '🇵🇾',
  Belize: '🇧🇿',
  Gwatemala: '🇬🇹',
  Honduras: '🇭🇳',
  Salwador: '🇸🇻',
  Kostaryka: '🇨🇷',
  Panama: '🇵🇦',
  Singapur: '🇸🇬',
  Indonezja: '🇮🇩',
};

export const splitCountryNames = (country: string): string[] => {
  return country
    .replace(/\s+i\s+/g, ',')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
};

export const getCountryFlag = (country: string): string => {
  const countries = splitCountryNames(country);

  if (countries.length > 1) {
    const flags = countries
      .map((countryName) => countryFlags[countryName])
      .filter(Boolean);

    if (flags.length === countries.length) {
      return flags.length <= 2 ? flags.join('') : `🌍${flags.length}`;
    }
  }

  return countryFlags[country] ?? country.slice(0, 2).toUpperCase();
};

export const getDealReasonColor = (
  reason?: string | null,
): 'success' | 'warning' | 'info' | 'secondary' | 'default' => {
  switch (reason) {
    case 'priceDrop':
      return 'success';
    case 'allTimeLow':
      return 'warning';
    case 'lowestPerTrip':
      return 'info';
    case 'combined':
      return 'secondary';
    default:
      return 'default';
  }
};

export const getDealReasonIcon = (reason?: string | null): React.ReactElement | undefined => {
  switch (reason) {
    case 'priceDrop':
      return <TrendingDownIcon fontSize="small" />;
    case 'allTimeLow':
      return <StarIcon fontSize="small" />;
    case 'lowestPerTrip':
      return <LocalOfferIcon fontSize="small" />;
    case 'combined':
      return <StarIcon fontSize="small" />;
    default:
      return undefined;
  }
};

export const formatDealPrice = (price: number): string => price.toLocaleString('pl-PL');

export const getPriceDropBadgeText = (
  currentPrice: number,
  previousPrice: number | null,
): string | null => {
  if (!previousPrice || previousPrice <= currentPrice) {
    return null;
  }

  const dropPct = (((previousPrice - currentPrice) / previousPrice) * 100).toFixed(0);
  return `-${dropPct}%`;
};