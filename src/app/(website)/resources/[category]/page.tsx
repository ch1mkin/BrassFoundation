import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResourceCategoryBrowser } from "@/components/website/resource-category-browser";
import { PageShell } from "@/components/website/page-shell";
import {
  RESOURCE_CATEGORIES,
  getResourceCategory,
  isResourceCategorySlug,
} from "@/lib/constants";
import { getPublishedResourcesByCategory } from "@/lib/content/queries";

type Props = { params: Promise<{ category: string }> };

export async function generateStaticParams() {
  return RESOURCE_CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const cat = getResourceCategory(category);
  return {
    title: cat ? `${cat.title} · Digital Library` : "Digital Library",
  };
}

export default async function ResourceCategoryPage({ params }: Props) {
  const { category } = await params;
  if (!isResourceCategorySlug(category)) notFound();

  const cat = getResourceCategory(category)!;
  const resources = await getPublishedResourcesByCategory(category);

  return (
    <PageShell
      eyebrow="Digital Library"
      title={cat.title}
      description={cat.subtitle}
      wide
    >
      <ResourceCategoryBrowser
        categorySlug={category}
        resources={resources}
      />
    </PageShell>
  );
}
