import LandingScreen from "@/screens/landing";
import type { Metadata } from "next";
import { DEFAULT_DESCRIPTION, OG_IMAGE_PATH, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  description: DEFAULT_DESCRIPTION,
  alternates: {
    canonical: `/`,
  },
  openGraph: {
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    type: "website",
    locale: "en_PH",
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [
      {
        url: OG_IMAGE_PATH,
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    images: [OG_IMAGE_PATH],
  },
};

export default function Page() {
  return <LandingScreen />;
}
