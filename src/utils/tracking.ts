/**
 * Utility to generate a tracking URL for a specific booking reference.
 */
export function getTrackingUrl(referenceCode: string): string {
  // Use the current window origin if available, otherwise default to the production URL
  const base = typeof window !== 'undefined' ? window.location.origin : 'https://palawanacupuncture.com';
  return `${base}/track/${referenceCode}`;
}
