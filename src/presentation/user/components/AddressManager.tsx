'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { getCities } from '@/application/location/getCities';
import { getZones } from '@/application/location/getZones';
import { getAreas } from '@/application/location/getAreas';
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from '@/application/address/addresses';
import type { UserAddressDto, CreateAddressInput } from '@/shared/types/api.types';
import type { PathaoCityDto, PathaoZoneDto, PathaoAreaDto } from '@/shared/types/api.types';
import type { User } from '@/domain/user/user.entity';
import { Button } from '@/components/ui/button';

// ─── Styles ───────────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.7rem', fontWeight: 600,
  textTransform: 'uppercase', letterSpacing: '0.12em',
  color: 'var(--on-surface-muted)', marginBottom: '0.3rem',
};

const selectStyle: React.CSSProperties = {
  width: '100%', padding: '0.5rem 0.75rem',
  border: '1px solid var(--border)',
  backgroundColor: 'var(--surface)', color: 'var(--on-surface)',
  fontSize: '0.875rem', outline: 'none', cursor: 'pointer',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

// ─── Address Form Modal ───────────────────────────────────────────────────────

interface AddressFormState {
  name:        string;
  phone:       string;
  addressLine: string;
  cityId:      number | null;
  cityName:    string;
  zoneId:      number | null;
  areaId:      number | null;
  postalCode:  string;
  isDefault:   boolean;
}

const EMPTY_FORM: AddressFormState = {
  name: '', phone: '', addressLine: '',
  cityId: null, cityName: '', zoneId: null, areaId: null,
  postalCode: '', isDefault: false,
};

function AddressModal({
  initial,
  prefillName,
  prefillPhone,
  onSave,
  onClose,
}: {
  initial?:      UserAddressDto;
  prefillName?:  string;
  prefillPhone?: string;
  onSave:        (a: UserAddressDto) => void;
  onClose:       () => void;
}) {
  const [form, setForm] = useState<AddressFormState>(
    initial
      ? {
          name:        initial.name        ?? '',
          phone:       initial.phone       ?? '',
          addressLine: initial.addressLine,
          cityId:      initial.cityId,
          cityName:    initial.city,
          zoneId:      initial.zoneId,
          areaId:      initial.areaId,
          postalCode:  initial.postalCode  ?? '',
          isDefault:   initial.isDefault,
        }
      : {
          ...EMPTY_FORM,
          name:  prefillName  ?? '',
          phone: prefillPhone ?? '',
        },
  );
  const [saving, setSaving] = useState(false);

  const [cities, setCities] = useState<PathaoCityDto[]>([]);
  const [zones,  setZones]  = useState<PathaoZoneDto[]>([]);
  const [areas,  setAreas]  = useState<PathaoAreaDto[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [zonesLoading,  setZonesLoading]  = useState(false);
  const [areasLoading,  setAreasLoading]  = useState(false);

  useEffect(() => {
    getCities().then(setCities).finally(() => setCitiesLoading(false));
  }, []);

  useEffect(() => {
    if (form.cityId == null) { setZones([]); setAreas([]); return; }
    setZonesLoading(true);
    setZones([]); setAreas([]);
    getZones(form.cityId).then(setZones).finally(() => setZonesLoading(false));
  }, [form.cityId]);

  useEffect(() => {
    if (form.zoneId == null) { setAreas([]); return; }
    setAreasLoading(true);
    setAreas([]);
    getAreas(form.zoneId).then(setAreas).finally(() => setAreasLoading(false));
  }, [form.zoneId]);

  const set = <K extends keyof AddressFormState>(k: K, v: AddressFormState[K]) =>
    setForm(p => ({ ...p, [k]: v }));

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id   = e.target.value ? Number(e.target.value) : null;
    const name = id ? e.target.options[e.target.selectedIndex].text : '';
    setForm(p => ({ ...p, cityId: id, cityName: name, zoneId: null, areaId: null }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.addressLine.trim() || !form.cityName) {
      toast.error('Address line and city are required.');
      return;
    }
    setSaving(true);
    try {
      const payload: CreateAddressInput = {
        addressLine: form.addressLine.trim(),
        city:        form.cityName,
        name:        form.name.trim()       || undefined,
        phone:       form.phone.trim()      || undefined,
        postalCode:  form.postalCode.trim() || undefined,
        cityId:      form.cityId ?? undefined,
        zoneId:      form.zoneId ?? undefined,
        areaId:      form.areaId ?? undefined,
        isDefault:   form.isDefault,
      };
      const saved = initial
        ? await updateAddress(initial.id, payload)
        : await createAddress(payload);
      onSave(saved);
      toast.success(initial ? 'Address updated.' : 'Address saved.');
    } catch {
      toast.error('Failed to save address.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--surface)',
          padding: '1.5rem', width: '100%', maxWidth: '32rem',
          maxHeight: '90vh', overflowY: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
          {initial ? 'Edit Address' : 'Add Address'}
        </h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            <Field label="Recipient Name">
              <Input value={form.name} onChange={e => set('name', e.target.value)} disabled={saving} placeholder="Optional" />
            </Field>
            <Field label="Phone">
              <Input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} disabled={saving} placeholder="01XXXXXXXXX" />
            </Field>
          </div>

          <Field label="Address Line *">
            <Input value={form.addressLine} onChange={e => set('addressLine', e.target.value)} disabled={saving} placeholder="House no., road, area" required />
          </Field>

          <Field label="City *">
            <select
              style={{ ...selectStyle, opacity: citiesLoading || saving ? 0.6 : 1 }}
              value={form.cityId ?? ''}
              onChange={handleCityChange}
              disabled={citiesLoading || saving}
              required
            >
              <option value="">{citiesLoading ? 'Loading…' : 'Select city'}</option>
              {cities.map(c => <option key={c.cityId} value={c.cityId}>{c.cityName}</option>)}
            </select>
          </Field>

          <Field label="Zone">
            <select
              style={{ ...selectStyle, opacity: !form.cityId || zonesLoading || saving ? 0.6 : 1 }}
              value={form.zoneId ?? ''}
              onChange={e => setForm(p => ({ ...p, zoneId: e.target.value ? Number(e.target.value) : null, areaId: null }))}
              disabled={!form.cityId || zonesLoading || saving}
            >
              <option value="">{zonesLoading ? 'Loading…' : 'Select zone'}</option>
              {zones.map(z => <option key={z.zoneId} value={z.zoneId}>{z.zoneName}</option>)}
            </select>
          </Field>

          <Field label="Area">
            <select
              style={{ ...selectStyle, opacity: !form.zoneId || areasLoading || saving ? 0.6 : 1 }}
              value={form.areaId ?? ''}
              onChange={e => set('areaId', e.target.value ? Number(e.target.value) : null)}
              disabled={!form.zoneId || areasLoading || saving}
            >
              <option value="">{areasLoading ? 'Loading…' : 'Select area'}</option>
              {areas.map(a => <option key={a.areaId} value={a.areaId}>{a.areaName}</option>)}
            </select>
          </Field>

          <Field label="Postal Code">
            <Input value={form.postalCode} onChange={e => set('postalCode', e.target.value)} disabled={saving} placeholder="Optional" />
          </Field>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.isDefault} onChange={e => set('isDefault', e.target.checked)} disabled={saving} />
            Set as default address
          </label>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Address Card ─────────────────────────────────────────────────────────────

function AddressCard({
  address,
  onEdit,
  onDelete,
}: {
  address:  UserAddressDto;
  onEdit:   () => void;
  onDelete: () => void;
}) {
  return (
    <div style={{
      border: '1px solid var(--border)',
      padding: '0.875rem 1rem', backgroundColor: 'var(--surface)',
      display: 'flex', flexDirection: 'column', gap: '0.25rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {address.name && <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{address.name}</span>}
        {address.phone && <span style={{ fontSize: '0.8rem', color: 'var(--on-surface-muted)' }}>{address.phone}</span>}
        {address.isDefault && (
          <span style={{ marginLeft: 'auto', fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.5rem', backgroundColor: '#d1fae5', color: '#065f46', textTransform: 'uppercase' }}>
            Default
          </span>
        )}
      </div>
      <p style={{ fontSize: '0.825rem', color: 'var(--on-surface-muted)', margin: 0 }}>
        {address.addressLine}
        {address.area ? `, ${address.area}` : ''}
        {`, ${address.city}`}
        {address.postalCode ? ` - ${address.postalCode}` : ''}
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
        <Button variant="ghost" size="sm" onClick={onEdit} style={{ fontSize: '0.72rem', fontWeight: 600, color: '#A58C69', background: 'none', padding: 0, height: 'auto' }}>Edit</Button>
        <Button variant="ghost" size="sm" onClick={onDelete} style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--destructive)', background: 'none', padding: 0, height: 'auto' }}>Delete</Button>
      </div>
    </div>
  );
}

// ─── AddressManager ───────────────────────────────────────────────────────────

export default function AddressManager({ user }: { user?: User | null }) {
  const [addresses, setAddresses] = useState<UserAddressDto[]>([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState<UserAddressDto | null | 'new'>(null);

  useEffect(() => {
    getAddresses()
      .then(setAddresses)
      .catch(() => toast.error('Failed to load addresses.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = (saved: UserAddressDto) => {
    setAddresses(prev => {
      const exists = prev.find(a => a.id === saved.id);
      // If new address is default, clear default on others
      const cleared = saved.isDefault
        ? prev.map(a => ({ ...a, isDefault: false }))
        : prev;
      return exists
        ? cleared.map(a => a.id === saved.id ? saved : a)
        : [...cleared, saved];
    });
    setModal(null);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteAddress(id);
      setAddresses(prev => prev.filter(a => a.id !== id));
      toast.success('Address deleted.');
    } catch {
      toast.error('Failed to delete address.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Saved Addresses</h2>
        <Button
          onClick={() => setModal('new')}
          style={{ fontSize: '0.8rem', fontWeight: 700, padding: '0.4rem 0.875rem', border: 'none', backgroundColor: 'var(--primary)', color: 'var(--on-primary)', cursor: 'pointer' }}
        >
          + Add Address
        </Button>
      </div>

      {loading ? (
        <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-muted)' }}>Loading…</p>
      ) : addresses.length === 0 ? (
        <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-muted)' }}>No saved addresses yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {addresses.map(a => (
            <AddressCard
              key={a.id}
              address={a}
              onEdit={() => setModal(a)}
              onDelete={() => handleDelete(a.id)}
            />
          ))}
        </div>
      )}

      {modal !== null && (
        <AddressModal
          initial={modal === 'new' ? undefined : modal}
          prefillName={modal === 'new' ? (user?.fullName ?? undefined) : undefined}
          prefillPhone={modal === 'new' ? (user?.phone ?? undefined) : undefined}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
