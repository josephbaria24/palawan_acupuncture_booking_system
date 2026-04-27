/**
 * Utility to generate a tracking URL for a specific booking reference.
 */
export function getTrackingUrl(referenceCode: string): string {
  // Use the current window origin if available, otherwise default to the production URL
  const fallback = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://www.palawanacupuncture.com";
  const base = typeof window !== "undefined" ? window.location.origin : fallback;
  return `${base}/track/${referenceCode}`;
}
