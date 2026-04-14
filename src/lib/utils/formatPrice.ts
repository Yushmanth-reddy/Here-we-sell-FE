/**
 * Converts price in cents (from backend) to a formatted INR string.
 * e.g. 150000 → "₹1,500.00"
 */
export function formatPrice(priceCents: number): string {
  const rupees = priceCents / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(rupees);
}

/**
 * Converts a rupee value (from user input) to cents for backend.
 * e.g. 1500 → 150000
 */
export function toCents(rupees: number): number {
  return Math.round(rupees * 100);
}
