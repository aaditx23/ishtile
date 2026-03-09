import { tokenStore } from '@/infrastructure/auth/tokenStore';

/**
 * Generate and download invoice PDF for an order.
 * Returns the filename of the downloaded PDF.
 */
export async function generateMemo(orderId: number): Promise<string> {
  const token = tokenStore.getAccess();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const res = await fetch(`/api/admin/memos/generate/${orderId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    let errorMessage = 'Failed to generate memo';
    try {
      const errorData = JSON.parse(text);
      errorMessage = errorData.message || errorMessage;
    } catch {
      errorMessage = text || errorMessage;
    }
    throw new Error(errorMessage);
  }

  // Get filename from Content-Disposition header
  const contentDisposition = res.headers.get('Content-Disposition');
  const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
  const filename = filenameMatch ? filenameMatch[1] : `invoice-${orderId}.pdf`;

  // Download the PDF
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);

  return filename;
}
