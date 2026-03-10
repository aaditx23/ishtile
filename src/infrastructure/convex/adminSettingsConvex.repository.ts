import { convex } from './convexClient';
import { api } from '../../../convex/_generated/api';
import type { AdminSettings } from '@/domain/adminSettings/adminSettings.entity';
import type { AdminSettingsRepository, UpdateAdminSettingsPayload } from '@/domain/adminSettings/adminSettings.repository';

export class AdminSettingsConvexRepository implements AdminSettingsRepository {
  async get(): Promise<AdminSettings> {
    const result = await convex.query(api.admin.queries.getAdminSettings, {});
    return {
      id: result.id,
      insideDhakaShippingCost: result.insideDhakaShippingCost,
      outsideDhakaShippingCost: result.outsideDhakaShippingCost,
    };
  }

  async update(payload: UpdateAdminSettingsPayload): Promise<AdminSettings> {
    await convex.mutation(api.admin.mutations.updateAdminSettings, payload);
    // Fetch the updated settings
    return this.get();
  }
}
