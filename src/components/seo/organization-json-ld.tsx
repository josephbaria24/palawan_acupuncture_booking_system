import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

/** Local clinic structured data; update telephone / address when you have final NAP details. */
export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    telephone: "+63-000-000-0000",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Puerto Princesa",
      addressRegion: "Palawan",
      addressCountry: "PH",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
