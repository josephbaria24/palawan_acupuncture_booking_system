import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PublicLayout } from "@/components/layout/public-layout";
import { ArticleJsonLd } from "@/components/seo/article-json-ld";
import { getArticleBySlug, getArticleSlugs } from "@/content/articles";
import { OG_IMAGE_PATH, SITE_NAME, SITE_URL } from "@/lib/site";
import { ArrowLeft, Clock } from "lucide-react";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: "Article" };

  const url = `${SITE_URL}/articles/${article.slug}`;
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/articles/${article.slug}` },
    openGraph: {
      title: `${article.title} | ${SITE_NAME}`,
      description: article.excerpt,
      type: "article",
      locale: "en_PH",
      url,
      siteName: SITE_NAME,
      publishedTime: article.publishedAt,
      images: [{ url: OG_IMAGE_PATH, width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${article.title} | ${SITE_NAME}`,
      description: article.excerpt,
      images: [OG_IMAGE_PATH],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  return (
    <PublicLayout>
      <ArticleJsonLd
        title={article.title}
        description={article.excerpt}
        slug={article.slug}
        publishedAt={article.publishedAt}
      />
      <article className="max-w-2xl mx-auto px-4 sm:px-6 pb-20">
        <Link
          href="/articles"
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors pt-2 pb-8"
        >
          <ArrowLeft size={16} />
          All articles
        </Link>

        <header className="border-b border-border/60 pb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-foreground leading-tight">
            {article.title}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">{article.excerpt}</p>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-medium">
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
          </div>
        </header>

        <div className="prose prose-neutral max-w-none mt-10 prose-headings:font-display prose-headings:font-bold prose-p:text-muted-foreground prose-p:leading-relaxed prose-h2:text-foreground prose-h2:mt-10 prose-h2:mb-4 prose-h2:text-xl sm:prose-h2:text-2xl">
          {article.blocks.map((block, i) =>
            block.type === "h2" ? (
              <h2 key={i}>{block.text}</h2>
            ) : (
              <p key={i}>{block.text}</p>
            ),
          )}
        </div>

        <footer className="mt-14 pt-8 border-t border-border/60">
          <p className="text-sm text-muted-foreground leading-relaxed">
            This article is for general education only and does not replace professional medical
            advice. If you have urgent symptoms, contact a doctor or emergency services.
          </p>
          <Link
            href="/book"
            className="mt-6 inline-flex rounded-2xl bg-primary text-primary-foreground px-6 py-3 font-bold text-sm hover:bg-primary/90 transition-colors"
          >
            Book an appointment
          </Link>
        </footer>
      </article>
    </PublicLayout>
  );
}
