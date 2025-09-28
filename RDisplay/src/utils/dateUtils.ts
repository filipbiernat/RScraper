/**
 * Date utilities for parsing and handling trip dates
 * Based on RScraper's processor.py date logic
 */

/**
 * Parse date from term format "dd.mm.yyyy - dd.mm.yyyy"
 */
export const parseDateFromTerm = (term: string): Date => {
  // Extract start date from the term
  const startDateStr = term.split(' - ')[0];
  const [day, month, year] = startDateStr.split('.').map(num => parseInt(num, 10));

  return new Date(year, month - 1, day);
};

/**
 * Parse end date from term format "dd.mm.yyyy - dd.mm.yyyy"
 */
export const parseEndDateFromTerm = (term: string): Date => {
  // Extract end date
  const endDateStr = term.split(' - ')[1];
  const [day, month, year] = endDateStr.split('.').map(num => parseInt(num, 10));

  return new Date(year, month - 1, day);
};

/**
 * Check if a trip has already started (past trip)
 */
export const isTripPast = (term: string): boolean => {
  const startDate = parseDateFromTerm(term);
  const today = new Date();
  return startDate < today;
};

/**
 * Sort terms by start date chronologically
 */
export const sortTermsByDate = (terms: string[]): string[] => {
  return terms.sort((a, b) => {
    const dateA = parseDateFromTerm(a);
    const dateB = parseDateFromTerm(b);
    return dateA.getTime() - dateB.getTime();
  });
};

/**
 * Format date for display
 */
export const formatDisplayDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Group trip terms by year and sort chronologically
 */
export const groupTermsByYear = (terms: any[]): any[] => {
  const currentYear = new Date().getFullYear();

  // Group terms by year
  const yearGroups = new Map<number, any[]>();

  terms.forEach(term => {
    const year = term.startDate.getFullYear();
    if (!yearGroups.has(year)) {
      yearGroups.set(year, []);
    }
    yearGroups.get(year)!.push(term);
  });

  // Convert to array and sort by year
  const sortedYears = Array.from(yearGroups.keys()).sort((a, b) => a - b);

  return sortedYears.map(year => ({
    year,
    terms: yearGroups.get(year)!.sort((a: any, b: any) =>
      a.startDate.getTime() - b.startDate.getTime()
    ),
    isExpanded: year === currentYear // Current year is expanded by default
  }));
};