import ShopLayout from '@/presentation/shared/layouts/ShopLayout';
import { getLookbooks } from '@/application/lookbook/getLookbooks';
import LookbookVerticalSlider from '@/presentation/lookbook/LookbookVerticalSlider';

export default async function LookbookPage() {
  let lookbooks = [];
  try {
    lookbooks = await getLookbooks({ activeOnly: true, limit: 100 });
  } catch {
    lookbooks = [];
  }

  return (
    <ShopLayout>
      <div style={{ width: '100%', margin: '0 auto' }}>
        <LookbookVerticalSlider lookbooks={lookbooks} />
      </div>
    </ShopLayout>
  );
}
