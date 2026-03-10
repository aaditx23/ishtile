import { AdminSettingsConvexRepository } from '@/infrastructure/convex/adminSettingsConvex.repository';
import type { AdminSettings } from '@/domain/adminSettings/adminSettings.entity';
import type { UpdateAdminSettingsPayload } from '@/domain/adminSettings/adminSettings.repository';

const adminSettingsRepository = new AdminSettingsConvexRepository();

export async function getAdminSettings(): Promise<AdminSettings> {
  return await adminSettingsRepository.get();
}

export async function updateAdminSettings(payload: UpdateAdminSettingsPayload): Promise<AdminSettings> {
  return await adminSettingsRepository.update(payload);
}
