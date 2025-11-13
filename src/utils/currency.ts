/**
 * Currency Utility Functions
 * Standardizes currency formatting across the application
 * Default: Tunisian Dinar (TND) with 3 decimal places
 */

export const CURRENCY_CODE = 'TND';
export const CURRENCY_DECIMALS = 3;

/**
 * Format a number as TND currency with 3 decimal places
 * @param amount - The amount to format
 * @returns Formatted string (e.g., "123.456 TND")
 */
export function formatPrice(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return `0.000 ${CURRENCY_CODE}`;
  }
  
  return `${numAmount.toFixed(CURRENCY_DECIMALS)} ${CURRENCY_CODE}`;
}

/**
 * Format a number as TND currency without the currency code
 * @param amount - The amount to format
 * @returns Formatted string (e.g., "123.456")
 */
export function formatAmount(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return '0.000';
  }
  
  return numAmount.toFixed(CURRENCY_DECIMALS);
}

/**
 * Parse a currency string to a number
 * @param priceString - The price string to parse
 * @returns Parsed number
 */
export function parsePrice(priceString: string): number {
  const cleaned = priceString.replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format price range
 * @param min - Minimum price
 * @param max - Maximum price
 * @returns Formatted range string
 */
export function formatPriceRange(min: number, max: number): string {
  return `${formatAmount(min)} - ${formatAmount(max)} ${CURRENCY_CODE}`;
}

/**
 * Calculate percentage of amount
 * @param amount - Base amount
 * @param percentage - Percentage to calculate
 * @returns Calculated amount
 */
export function calculatePercentage(amount: number, percentage: number): number {
  return (amount * percentage) / 100;
}

/**
 * Format currency for display in inputs (without currency code)
 * @param amount - The amount to format
 * @returns Formatted string for input fields
 */
export function formatForInput(amount: number | string): string {
  return formatAmount(amount);
}

/**
 * Validate if a string is a valid price format
 * @param value - String to validate
 * @returns True if valid price format
 */
export function isValidPrice(value: string): boolean {
  const regex = /^\d+(\.\d{0,3})?$/;
  return regex.test(value);
}
