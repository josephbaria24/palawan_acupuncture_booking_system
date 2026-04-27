import type { MetadataRoute } from "next";
import { getArticleSlugs } from "@/content/articles";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const base = SITE_URL;

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: now },
    { url: `${base}/book`, lastModified: now },
    { url: `${base}/track`, lastModified: now },
    { url: `${base}/articles`, lastModified: now },
  ];

  const articlePages: MetadataRoute.Sitemap = getArticleSlugs().map((slug) => ({
    url: `${base}/articles/${slug}`,
    lastModified: now,
  }));

  return [...staticPages, ...articlePages];
}
