import { SITE_NAME, SITE_URL } from "@/lib/site";

type Props = {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
};

export function ArticleJsonLd({ title, description, slug, publishedAt }: Props) {
  const url = `${SITE_URL}/articles/${slug}`;
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    datePublished: publishedAt,
    author: {
      "@type": "Organization",
      name: SITE_NAME,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
