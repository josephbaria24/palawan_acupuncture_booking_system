/** Production base URL (no trailing slash). Set Vercel `NEXT_PUBLIC_SITE_URL` to this (e.g. https://www.palawanacupuncture.com). */
function normalizeSiteUrl(url: string): string {
  return url.replace(/\/$/, "");
}

const fallback = "https://www.palawanacupuncture.com";

export const SITE_URL = normalizeSiteUrl(
  typeof process.env.NEXT_PUBLIC_SITE_URL === "string" && process.env.NEXT_PUBLIC_SITE_URL.length > 0
    ? process.env.NEXT_PUBLIC_SITE_URL
    : fallback,
);

export const SITE_NAME = "Palawan Acupuncture";
export const DEFAULT_DESCRIPTION =
  "PITAHC-certified acupuncture in Puerto Princesa, Palawan. Book online, track your appointment, and read patient guides.";
/** Used for Open Graph / Twitter when available in `public/` */
export const OG_IMAGE_PATH = "/images/logo.png";
