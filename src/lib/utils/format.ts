/**
 * Centralized formatting utility for BoloBiz metrics and values.
 */

/**
 * Format a numeric value into the business's currency representation.
 * Supports standard Indian English formatting (e.g. ₹1,25,000) for INR.
 * 
 * @param amount - The numeric value to format
 * @param currency - The currency code (default: INR)
 */
export function formatCurrency(amount: number, currency: string = "INR"): string {
  try {
    const locale = currency === "INR" ? "en-IN" : "en-US";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    console.error("Format currency error:", error);
    // Fallback formatting
    const symbol = currency === "INR" ? "₹" : "$";
    return `${symbol}${amount.toLocaleString("en-IN")}`;
  }
}

/**
 * Format a number using Indian grouping layout for legibility (e.g. 1,25,000).
 * 
 * @param value - The numeric value to format
 */
export function formatNumber(value: number): string {
  try {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  } catch (error) {
    console.error("Format number error:", error);
    return value.toLocaleString();
  }
}
