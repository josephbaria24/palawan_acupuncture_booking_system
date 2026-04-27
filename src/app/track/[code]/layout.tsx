import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";

const description =
  "View your acupuncture booking status using your private reference code.";

export const metadata: Metadata = {
  title: { absolute: `Booking status | ${SITE_NAME}` },
  description,
  robots: {
    index: false,
    follow: false,
  },
};

export default function TrackCodeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
