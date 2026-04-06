import "./globals.css";
import { Providers } from "./providers";
import { GeistSans } from "geist/font/sans";

export const metadata = {
  title: "Palawan Acupuncture - Holistic Healing",
  description: "Traditional healing combined with modern convenience.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

