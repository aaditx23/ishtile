'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getCities } from '@/application/location/getCities';
import { getZones } from '@/application/location/getZones';
import { getAreas } from '@/application/location/getAreas';
import type { PathaoAreaDto, PathaoCityDto, PathaoZoneDto } from '@/shared/types/api.types';
import {
  addPathaoStoreFromResponseToDb,
  createPathaoStoreConfig,
  listPathaoAvailableStores,
  listPathaoStores,
  setActivePathaoStore,
  updatePathaoStoreConfig,
  type PathaoAvailableStore,
  type PathaoStore,
  type PathaoStoreForm,
} from '@/application/pathaoStores/pathaoStores';

const labelStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'var(--on-surface-muted)',
  marginBottom: '0.375rem',
  display: 'block',
};

const primaryBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.375rem',
  padding: '0.5rem 1.25rem',
  backgroundColor: 'var(--primary)',
  color: 'var(--on-primary)',
  border: 'none',
  cursor: 'pointer',
  fontSize: '0.8rem',
  fontWeight: 700,
};

const EMPTY_FORM: PathaoStoreForm = {
  storeName: '',
  contactNumber: '',
  address: '',
  cityId: 0,
  zoneId: 0,
  areaId: 0,
};

export default function PathaoStoreManagementPanel() {
  const [stores, setStores] = useState<PathaoStore[]>([]);
  const [availableStores, setAvailableStores] = useState<PathaoAvailableStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activatingId, setActivatingId] = useState<number | null>(null);
  const [addingStoreId, setAddingStoreId] = useState<number | null>(null);

  const [form, setForm] = useState<PathaoStoreForm>(EMPTY_FORM);
  const [editingStoreId, setEditingStoreId] = useState<number | null>(null);

  const [cities, setCities] = useState<PathaoCityDto[]>([]);
  const [zones, setZones] = useState<PathaoZoneDto[]>([]);
  const [areas, setAreas] = useState<PathaoAreaDto[]>([]);
  const [rowAreas, setRowAreas] = useState<Record<number, PathaoAreaDto[]>>({});
  const [rowAreaValue, setRowAreaValue] = useState<Record<number, number>>({});
  const [rowAreasLoading, setRowAreasLoading] = useState<Record<number, boolean>>({});
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [zonesLoading, setZonesLoading] = useState(false);
  const [areasLoading, setAreasLoading] = useState(false);
  const [showEmptyHint, setShowEmptyHint] = useState(false);

  const activeStoreId = useMemo(() => stores.find((s) => s.isActive)?.storeId ?? null, [stores]);

  const refreshStores = async () => {
    const [rows, available] = await Promise.all([
      listPathaoStores(),
      listPathaoAvailableStores(),
    ]);
    setStores(rows);
    setAvailableStores(available);
  };

  useEffect(() => {
    Promise.all([refreshStores(), getCities().then(setCities)])
      .catch(() => toast.error('Failed to load Pathao store data.'))
      .finally(() => {
        setLoading(false);
        setCitiesLoading(false);
      });
  }, []);

  useEffect(() => {
    setShowEmptyHint(!loading && stores.length === 0);
  }, [loading, stores.length]);

  useEffect(() => {
    if (!form.cityId) {
      setZones([]);
      setAreas([]);
      return;
    }

    setZonesLoading(true);
    getZones(form.cityId)
      .then(setZones)
      .catch(() => toast.error('Failed to load zones.'))
      .finally(() => setZonesLoading(false));
  }, [form.cityId]);

  useEffect(() => {
    if (!form.zoneId) {
      setAreas([]);
      return;
    }

    setAreasLoading(true);
    getAreas(form.zoneId)
      .then(setAreas)
      .catch(() => toast.error('Failed to load areas.'))
      .finally(() => setAreasLoading(false));
  }, [form.zoneId]);

  const setField = <K extends keyof PathaoStoreForm>(key: K, value: PathaoStoreForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setEditingStoreId(null);
    setForm(EMPTY_FORM);
  };

  const startEdit = (store: PathaoStore) => {
    setEditingStoreId(store.storeId);
    setForm({
      storeName: store.storeName,
      contactNumber: store.contactNumber,
      address: store.address,
      cityId: store.cityId,
      zoneId: store.zoneId,
      areaId: store.areaId,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.storeName.trim() || !form.contactNumber.trim() || !form.address.trim() || !form.cityId || !form.zoneId || !form.areaId) {
      toast.error('All Pathao store fields are required.');
      return;
    }

    setSaving(true);
    try {
      if (editingStoreId) {
        await updatePathaoStoreConfig(editingStoreId, {
          ...form,
          storeName: form.storeName.trim(),
          contactNumber: form.contactNumber.trim(),
          address: form.address.trim(),
        });
        toast.success('Pathao store updated.');
      } else {
        const result = await createPathaoStoreConfig({
          ...form,
          storeName: form.storeName.trim(),
          contactNumber: form.contactNumber.trim(),
          address: form.address.trim(),
        });
        toast.success(result.message);
      }

      await refreshStores();
      resetForm();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save store.');
    } finally {
      setSaving(false);
    }
  };

  const handleActivate = async (storeId: number) => {
    setActivatingId(storeId);
    try {
      await setActivePathaoStore(storeId);
      await refreshStores();
      toast.success('Active Pathao store updated.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to set active store.');
    } finally {
      setActivatingId(null);
    }
  };

  const loadRowAreas = async (storeId: number, zoneId: number) => {
    if (rowAreas[storeId] && rowAreas[storeId].length > 0) return;
    setRowAreasLoading((prev) => ({ ...prev, [storeId]: true }));
    try {
      const options = await getAreas(zoneId);
      setRowAreas((prev) => ({ ...prev, [storeId]: options }));
    } catch {
      toast.error('Failed to load areas for store.');
    } finally {
      setRowAreasLoading((prev) => ({ ...prev, [storeId]: false }));
    }
  };

  const handleAddFromResponse = async (store: PathaoAvailableStore) => {
    const needsArea = store.status === 'missing' || !store.dbAreaId;
    const selectedAreaId = rowAreaValue[store.storeId] ?? store.dbAreaId ?? 0;

    if (needsArea && !selectedAreaId) {
      toast.error('Please select an area before adding this store.');
      return;
    }

    setAddingStoreId(store.storeId);
    try {
      await addPathaoStoreFromResponseToDb(store.storeId, selectedAreaId);
      await refreshStores();
      toast.success('Store added to DB from Pathao response.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add store to DB.');
    } finally {
      setAddingStoreId(null);
    }
  };

  return (
    <div
      className="p-4 sm:p-6"
      style={{
        border: '1px solid var(--border)',
        backgroundColor: 'var(--surface)',
      }}
    >
      <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Pathao Store Management</h2>
      <p style={{ fontSize: '0.82rem', color: 'var(--on-surface-muted)', marginBottom: '1rem' }}>
        Create a store, edit store details, and choose which store is active for Pathao order/parcel requests.
      </p>

      {showEmptyHint && (
        <div
          style={{
            border: '1px dashed var(--border)',
            backgroundColor: 'var(--surface-muted)',
            padding: '0.875rem',
            marginBottom: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.625rem',
          }}
        >
          <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-muted)', margin: 0 }}>
            No Pathao store configured yet. Create your first store to enable Pathao parcel/order requests.
          </p>
          <div>
            <Button
              type="button"
              onClick={() => {
                resetForm();
                setShowEmptyHint(false);
              }}
              style={primaryBtn}
            >
              Create your first Pathao store
            </Button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1rem' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: '0.875rem' }}>
          <div>
            <label style={labelStyle}>Store Name</label>
            <Input
              value={form.storeName}
              onChange={(e) => setField('storeName', e.target.value)}
              placeholder="Store name"
              disabled={saving}
              required
            />
          </div>
          <div>
            <label style={labelStyle}>Store Contact</label>
            <Input
              value={form.contactNumber}
              onChange={(e) => setField('contactNumber', e.target.value)}
              placeholder="01XXXXXXXXX"
              disabled={saving}
              required
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Store Address</label>
          <Input
            value={form.address}
            onChange={(e) => setField('address', e.target.value)}
            placeholder="Address"
            disabled={saving}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: '0.875rem' }}>
          <div>
            <label style={labelStyle}>City</label>
            <select
              value={form.cityId || ''}
              onChange={(e) => {
                const cityId = Number(e.target.value || 0);
                setForm((prev) => ({ ...prev, cityId, zoneId: 0, areaId: 0 }));
              }}
              disabled={saving || citiesLoading}
              style={{ width: '100%', border: '1px solid var(--border)', padding: '0.55rem 0.7rem', backgroundColor: 'var(--surface)', fontSize: '0.875rem' }}
              required
            >
              <option value="">{citiesLoading ? 'Loading cities…' : 'Select city'}</option>
              {cities.map((c) => (
                <option key={c.cityId} value={c.cityId}>{c.cityName}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Zone</label>
            <select
              value={form.zoneId || ''}
              onChange={(e) => {
                const zoneId = Number(e.target.value || 0);
                setForm((prev) => ({ ...prev, zoneId, areaId: 0 }));
              }}
              disabled={saving || zonesLoading || !form.cityId}
              style={{ width: '100%', border: '1px solid var(--border)', padding: '0.55rem 0.7rem', backgroundColor: 'var(--surface)', fontSize: '0.875rem' }}
              required
            >
              <option value="">{zonesLoading ? 'Loading zones…' : 'Select zone'}</option>
              {zones.map((z) => (
                <option key={z.zoneId} value={z.zoneId}>{z.zoneName}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Area</label>
            <select
              value={form.areaId || ''}
              onChange={(e) => setField('areaId', Number(e.target.value || 0))}
              disabled={saving || areasLoading || !form.zoneId}
              style={{ width: '100%', border: '1px solid var(--border)', padding: '0.55rem 0.7rem', backgroundColor: 'var(--surface)', fontSize: '0.875rem' }}
              required
            >
              <option value="">{areasLoading ? 'Loading areas…' : 'Select area'}</option>
              {areas.map((a) => (
                <option key={a.areaId} value={a.areaId}>{a.areaName}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row" style={{ gap: '0.75rem', justifyContent: 'flex-end' }}>
          {editingStoreId && (
            <Button type="button" variant="outline" onClick={resetForm} disabled={saving} className="w-full sm:w-auto">
              Cancel Edit
            </Button>
          )}
          <Button type="submit" disabled={saving} style={primaryBtn} className="w-full sm:w-auto">
            {saving ? 'Saving...' : editingStoreId ? 'Update Store' : 'Create Store'}
          </Button>
        </div>
      </form>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem' }}>Available Stores</h3>
        {loading ? (
          <p style={{ color: 'var(--on-surface-muted)', fontSize: '0.85rem' }}>Loading stores…</p>
        ) : availableStores.length === 0 ? (
          <p style={{ color: 'var(--on-surface-muted)', fontSize: '0.85rem' }}>No stores returned by Pathao list response.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {availableStores.map((store) => {
              const needsAreaInput = store.status === 'missing' || !store.dbAreaId;
              const selectedAreaId = rowAreaValue[store.storeId] ?? store.dbAreaId ?? 0;

              return (
              <div
                key={store.storeId}
                style={{
                  border: '1px solid var(--border)',
                  padding: '0.75rem',
                  backgroundColor: store.dbIsActive ? 'var(--surface-muted)' : 'var(--surface)',
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between" style={{ gap: '0.75rem' }}>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>{store.storeName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-muted)' }}>
                      Store ID: {store.storeId}{store.contactNumber ? ` • ${store.contactNumber}` : ''}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-muted)' }}>
                      {store.storeAddress}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--on-surface-muted)' }}>
                      City {store.cityId} • Zone {store.zoneId}
                    </div>
                  </div>

                  <div className="flex w-full sm:w-auto" style={{ alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {store.status === 'valid' && (
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.2rem 0.45rem', backgroundColor: 'var(--success-bg)', color: 'var(--on-success)' }}>
                        VALID
                      </span>
                    )}
                    {store.status !== 'valid' && (
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.2rem 0.45rem', backgroundColor: 'var(--surface-muted)', color: 'var(--on-surface-muted)', border: '1px solid var(--border)' }}>
                        {store.status === 'missing' ? 'NOT IN DB' : 'INVALID'}
                      </span>
                    )}
                    {store.dbIsActive && (
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.2rem 0.45rem', backgroundColor: 'var(--success-bg)', color: 'var(--on-success)' }}>
                        ACTIVE
                      </span>
                    )}
                    <Button type="button" variant="outline" onClick={() => startEdit(stores.find((s) => s.storeId === store.storeId) ?? {
                      storeId: store.storeId,
                      storeName: store.storeName,
                      contactNumber: store.contactNumber,
                      address: store.storeAddress,
                      cityId: store.cityId,
                      zoneId: store.zoneId,
                      areaId: store.dbAreaId ?? 0,
                      isActive: store.dbIsActive,
                      createdAt: 0,
                    })} disabled={!store.canUse || saving || activatingId !== null} className="w-full sm:w-auto">
                      Edit
                    </Button>
                    <Button
                      type="button"
                      onClick={() => handleActivate(store.storeId)}
                      disabled={!store.canUse || store.storeId === activeStoreId || saving || activatingId !== null}
                      className="w-full sm:w-auto"
                    >
                      {activatingId === store.storeId ? 'Selecting…' : !store.canUse ? 'Not Usable' : store.storeId === activeStoreId ? 'Selected' : 'Use This Store'}
                    </Button>
                    {!store.canUse && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleAddFromResponse(store)}
                        disabled={addingStoreId !== null || (needsAreaInput && !selectedAreaId)}
                        className="w-full sm:w-auto"
                      >
                        {addingStoreId === store.storeId ? 'Adding…' : 'Add To DB'}
                      </Button>
                    )}
                  </div>
                </div>

                {!store.canUse && needsAreaInput && (
                  <div style={{ marginTop: '0.65rem' }}>
                    <label style={{ ...labelStyle, marginBottom: '0.3rem' }}>Area (required to add to DB)</label>
                    <select
                      value={selectedAreaId || ''}
                      onFocus={() => void loadRowAreas(store.storeId, store.zoneId)}
                      onChange={(e) => setRowAreaValue((prev) => ({ ...prev, [store.storeId]: Number(e.target.value || 0) }))}
                      disabled={Boolean(rowAreasLoading[store.storeId]) || addingStoreId === store.storeId}
                      style={{ width: '100%', border: '1px solid var(--border)', padding: '0.55rem 0.7rem', backgroundColor: 'var(--surface)', fontSize: '0.875rem' }}
                    >
                      <option value="">{rowAreasLoading[store.storeId] ? 'Loading areas…' : 'Select area'}</option>
                      {(rowAreas[store.storeId] ?? []).map((a) => (
                        <option key={a.areaId} value={a.areaId}>{a.areaName}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
