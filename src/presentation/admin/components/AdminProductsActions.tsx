'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { deleteProduct } from '@/application/product/adminProduct';

interface AdminProductsActionsProps {
  productId:   number;
  productName: string;
}

export default function AdminProductsActions({ productId, productName }: AdminProductsActionsProps) {
  const router              = useRouter();
  const [busy, setBusy]     = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete "${productName}"? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await deleteProduct(productId);
      toast.success('Product deleted.');
      router.refresh();
    } catch {
      toast.error('Failed to delete product.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={busy}
      style={{
        background: 'none',
        border:     'none',
        cursor:     busy ? 'not-allowed' : 'pointer',
        color:      'var(--destructive)',
        fontSize:   '0.75rem',
        fontWeight: 600,
        padding:    0,
      }}
    >
      {busy ? '…' : 'Delete'}
    </button>
  );
}
