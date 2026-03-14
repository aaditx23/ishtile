import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
export async function resolvePathaoStoreId(): Promise<number> {
  const existing = await convex.query((api as any).shipments.queries.getActivePathaoStore, {});
  if (existing?.storeId) return Number(existing.storeId);
  throw new Error('No active Pathao store configured. Please configure one in Admin Settings.');
}
