import type { AdminSettings } from './adminSettings.entity';

export interface UpdateAdminSettingsPayload {
  insideDhakaShippingCost?: number;
  outsideDhakaShippingCost?: number;
}

export interface AdminSettingsRepository {
  get(): Promise<AdminSettings>;
  update(payload: UpdateAdminSettingsPayload): Promise<AdminSettings>;
}
