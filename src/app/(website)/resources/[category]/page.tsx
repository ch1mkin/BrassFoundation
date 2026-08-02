import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResourceCategoryBrowser } from "@/components/website/resource-category-browser";
import { PageShell } from "@/components/website/page-shell";
import { getPublishedResourcesByCategory } from "@/lib/content/queries";
import {
  getResourceCategories,
  getResourceCategoryBySlug,
} from "@/lib/content/resource-categories";

type Props = { params: Promise<{ category: string }> };

export async function generateStaticParams() {
  const cats = await getResourceCategories();
  return cats.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const cat = await getResourceCategoryBySlug(category);
  return {
    title: cat ? `${cat.title} · Digital Library` : "Digital Library",
  };
}

export default async function ResourceCategoryPage({ params }: Props) {
  const { category } = await params;
  const [cat, categories, resources] = await Promise.all([
    getResourceCategoryBySlug(category),
    getResourceCategories(),
    getPublishedResourcesByCategory(category),
  ]);
  if (!cat) notFound();

  return (
    <PageShell
      eyebrow="Digital Library"
      title={cat.title}
      description={cat.subtitle || undefined}
      wide
    >
      <ResourceCategoryBrowser
        categorySlug={category}
        categories={categories}
        resources={resources}
      />
    </PageShell>
  );
}
