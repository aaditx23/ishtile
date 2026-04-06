/**
 * Generate batch CSV export for selected orders
 * Similar to generateBatchMemo but for CSV format
 */

import { tokenStore } from '@/infrastructure/auth/tokenStore';

export async function generateBatchCsv(orderIds: string[]): Promise<void> {
  const token = tokenStore.getAccess();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch('/api/admin/memos/csv-batch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ orderIds }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to generate CSV');
  }

  // Get filename from Content-Disposition header or use default
  const disposition = res.headers.get('Content-Disposition');
  let filename = 'orders-batch.csv';
  if (disposition) {
    const match = disposition.match(/filename="?([^"]+)"?/);
    if (match) filename = match[1];
  }

  // Download the CSV file
  const blob = await res.blob();
  
  // Debug: check if blob has content
  console.log('[CSV Download] Blob size:', blob.size, 'type:', blob.type);
  
  if (blob.size === 0) {
    throw new Error('CSV file is empty');
  }
  
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  
  // Use setTimeout to ensure DOM update before click
  setTimeout(() => {
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
}
