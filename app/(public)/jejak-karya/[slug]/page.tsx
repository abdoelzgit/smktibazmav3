import { getJejakKaryaBySlug, JEJAK_KARYA_LIST } from "@/lib/jejak-karya-data";
import { JejakKaryaDetailClient } from "./jejak-karya-detail";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return JEJAK_KARYA_LIST.map((item) => ({
    slug: item.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const project = getJejakKaryaBySlug(slug);

  return {
    title: `${project.title} - Jejak Karya SMK TI BAZMA`,
    description: project.description,
  };
}

export default async function JejakKaryaDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const project = getJejakKaryaBySlug(slug);

  return <JejakKaryaDetailClient project={project} />;
}
