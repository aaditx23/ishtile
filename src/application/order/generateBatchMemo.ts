import { tokenStore } from '@/infrastructure/auth/tokenStore';

/**
 * POST all selected order IDs to /api/admin/memos/batch and download
 * the resulting combined PDF as MEMOS-batch.pdf.
 */
export async function generateBatchMemo(orderIds: string[]): Promise<void> {
  const token = tokenStore.getAccess();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch('/api/admin/memos/batch', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({ orderIds }),
  });

  if (!res.ok) {
    const text = await res.text();
    let errorMessage = 'Failed to generate batch memo';
    try {
      const data = JSON.parse(text);
      errorMessage = data.message || errorMessage;
    } catch {
      errorMessage = text || errorMessage;
    }
    throw new Error(errorMessage);
  }

  const blob = await res.blob();
  const url  = window.URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'MEMOS-batch.pdf';
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
