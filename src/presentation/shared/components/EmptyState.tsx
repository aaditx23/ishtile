import { FiShoppingBag } from 'react-icons/fi';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export default function EmptyState({
  title = 'Nothing here yet',
  description = "We're working on adding products to this category. Check back soon.",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 px-6 text-center" style={{padding:'1rem'}}>
      <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center">
        <FiShoppingBag size={28} className="text-neutral-400" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold uppercase tracking-widest text-neutral-700">{title}</p>
        <p className="text-sm text-neutral-400 max-w-xs">{description}</p>
      </div>
    </div>
  );
}
