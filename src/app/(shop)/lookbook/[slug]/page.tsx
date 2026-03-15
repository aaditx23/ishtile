import { notFound } from 'next/navigation';
import ShopLayout from '@/presentation/shared/layouts/ShopLayout';
import LookbookDetailView from '@/presentation/lookbook/LookbookDetailView';
import { getLookbookBySlug } from '@/application/lookbook/getLookbookBySlug';

interface Params {
  slug: string;
}

export default async function LookbookDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;

  let lookbook = null;
  try {
    lookbook = await getLookbookBySlug(slug);
  } catch {
    lookbook = null;
  }

  if (!lookbook) notFound();

  return (
    <ShopLayout>
      <LookbookDetailView lookbook={lookbook} />
    </ShopLayout>
  );
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  try {
    const lookbook = await getLookbookBySlug(slug);
    return {
      title: lookbook ? `${lookbook.title} — Lookbook` : 'Lookbook Not Found',
      description: lookbook?.body ?? undefined,
    };
  } catch {
    return { title: 'Lookbook' };
  }
}
