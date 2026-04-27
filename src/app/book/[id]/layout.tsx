import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";

const description = "Complete your acupuncture session booking.";

export const metadata: Metadata = {
  title: { absolute: `Complete your booking | ${SITE_NAME}` },
  description,
  robots: {
    index: false,
    follow: false,
  },
};

export default function BookSessionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
