/**
 * Date utilities for parsing and handling trip dates
 * Based on RScraper's processor.py date logic
 */

/**
 * Parse date from term format "dd.mm - dd.mm" and assign proper year
 * Logic matches RScraper's parse_date_from_term function
 */
export const parseDateFromTerm = (term: string): Date => {
  const today = new Date();

  // Extract start date from format "dd.mm - dd.mm"
  const startDateStr = term.split(' - ')[0];
  const [day, month] = startDateStr.split('.').map(num => parseInt(num, 10));

  // Create date with current year
  let fullDate = new Date(today.getFullYear(), month - 1, day);

  // If date is in the past, assign next year
  if (fullDate < today) {
    fullDate.setFullYear(today.getFullYear() + 1);
  }

  return fullDate;
};

/**
 * Parse end date from term format "dd.mm - dd.mm"
 */
export const parseEndDateFromTerm = (term: string): Date => {
  const startDate = parseDateFromTerm(term);

  // Extract end date
  const endDateStr = term.split(' - ')[1];
  const [day, month] = endDateStr.split('.').map(num => parseInt(num, 10));

  let endDate = new Date(startDate.getFullYear(), month - 1, day);

  // If end month is before start month, it's likely next year
  if (endDate < startDate) {
    endDate.setFullYear(startDate.getFullYear() + 1);
  }

  return endDate;
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