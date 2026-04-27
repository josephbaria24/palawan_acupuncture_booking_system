import type { Metadata } from "next";
import { OG_IMAGE_PATH, SITE_NAME, SITE_URL } from "@/lib/site";

const title = "Track your session";
const description =
  "Enter your booking reference code to view your acupuncture appointment status in Puerto Princesa, Palawan.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/track",
  },
  openGraph: {
    title: `${title} | ${SITE_NAME}`,
    description,
    type: "website",
    locale: "en_PH",
    url: `${SITE_URL}/track`,
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
    title: `${title} | ${SITE_NAME}`,
    description,
    images: [OG_IMAGE_PATH],
  },
};

export default function TrackLayout({ children }: { children: React.ReactNode }) {
  return children;
}
