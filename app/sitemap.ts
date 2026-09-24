import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { baseUrl } from "@/lib/stripe";
import { ARTICLES } from "@/lib/articles";
import { LANDING_PAGES } from "@/lib/landing";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = baseUrl();

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/creeaza`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/modele`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/tarife`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/ghiduri`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/pentru-scoli`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/contact`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/termeni`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/confidentialitate`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/cookies`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const landing: MetadataRoute.Sitemap = LANDING_PAGES.map((page) => ({
    url: `/`,
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  const articles: MetadataRoute.Sitemap = ARTICLES.map((article) => ({
    url: `${base}/ghiduri/${article.slug}`,
    lastModified: new Date(article.updated),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // Creatiile publice sunt continut real, indexabil.
  let creations: MetadataRoute.Sitemap = [];
  try {
    const rows = await prisma.generation.findMany({
      where: { isPublic: true, status: "COMPLETED" },
      orderBy: { createdAt: "desc" },
      take: 500,
      select: { id: true, completedAt: true, createdAt: true },
    });
    creations = rows.map((row) => ({
      url: `${base}/model/${row.id}`,
      lastModified: row.completedAt ?? row.createdAt,
      changeFrequency: "yearly",
      priority: 0.5,
    }));
  } catch (error) {
    // Un sitemap partial este mai bun decat unul lipsa.
    console.error("[sitemap] creatiile nu au putut fi citite:", error);
  }

  return [...staticPages, ...landing, ...articles, ...creations];
}
