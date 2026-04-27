import Link from "next/link";
import type { Metadata } from "next";
import { PublicLayout } from "@/components/layout/public-layout";
import { getAllArticles } from "@/content/articles";
import { DEFAULT_DESCRIPTION, OG_IMAGE_PATH, SITE_NAME, SITE_URL } from "@/lib/site";
import { ArrowRight, BookOpen, Clock } from "lucide-react";

const title = "Articles";

export const metadata: Metadata = {
  title,
  description: `${DEFAULT_DESCRIPTION} Read short guides on acupuncture, first visits, pain and stress, digestion, and aftercare.`,
  alternates: {
    canonical: "/articles",
  },
  openGraph: {
    title: `${title} | ${SITE_NAME}`,
    description: `Educational articles on acupuncture and wellness from ${SITE_NAME}.`,
    type: "website",
    locale: "en_PH",
    url: `${SITE_URL}/articles`,
    siteName: SITE_NAME,
    images: [{ url: OG_IMAGE_PATH, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} | ${SITE_NAME}`,
    description: `Educational articles on acupuncture and wellness from ${SITE_NAME}.`,
    images: [OG_IMAGE_PATH],
  },
};

export default function ArticlesPage() {
  const list = getAllArticles();

  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-20">
        <header className="pt-4 pb-10 border-b border-border/60">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-bold uppercase tracking-widest mb-4">
            <BookOpen size={14} />
            Learning
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-black tracking-tight text-foreground">
            Acupuncture articles
          </h1>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg leading-relaxed max-w-2xl">
            Plain-language guides on what to expect, common goals, and aftercare. For medical
            decisions, always follow advice from your physician.
          </p>
        </header>

        <ul className="mt-10 space-y-6">
          {list.map((article) => (
            <li key={article.slug}>
              <Link
                href={`/articles/${article.slug}`}
                className="group block rounded-[1.75rem] border border-border/70 bg-card p-6 sm:p-8 shadow-sm hover:shadow-md hover:border-primary/25 transition-all duration-300"
              >
                <div className="flex flex-wrap gap-2 mb-3">
                  {article.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground group-hover:text-primary transition-colors">
                  {article.title}
                </h2>
                <p className="mt-2 text-muted-foreground leading-relaxed">{article.excerpt}</p>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-medium">
                  <time dateTime={article.publishedAt}>
                    {new Date(article.publishedAt + "T12:00:00").toLocaleDateString("en-PH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} className="text-primary" />
                    {article.readingMinutes} min read
                  </span>
                  <span className="flex items-center gap-1 text-primary font-bold ml-auto">
                    Read
                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </PublicLayout>
  );
}
