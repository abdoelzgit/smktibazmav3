import { getPublishedJejakKaryaBySlugAction, getPublishedJejakKaryaAction } from "@/app/actions/jejak-karya-list";
import { JejakKaryaDetailClient } from "./jejak-karya-detail";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const res = await getPublishedJejakKaryaAction();
  if (!res.success || !res.data) return [];
  return res.data.map((item: { slug: string }) => ({
    slug: item.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const res = await getPublishedJejakKaryaBySlugAction(slug);

  if (!res.success || !res.data) {
    return { title: "Jejak Karya - SMK TI BAZMA" };
  }

  const project = res.data;
  return {
    title: `${project.title} - Jejak Karya SMK TI BAZMA`,
    description: project.description,
  };
}

export default async function JejakKaryaDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const res = await getPublishedJejakKaryaBySlugAction(slug);

  if (!res.success || !res.data) {
    notFound();
  }

  return <JejakKaryaDetailClient project={res.data} />;
}
