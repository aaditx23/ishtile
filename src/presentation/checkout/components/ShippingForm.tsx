'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { getCities } from '@/application/location/getCities';
import { getZones } from '@/application/location/getZones';
import { getAreas } from '@/application/location/getAreas';
import type { PathaoCityDto, PathaoZoneDto, PathaoAreaDto } from '@/shared/types/api.types';
import { ADDRESS_MAX_LENGTH, ADDRESS_MIN_LENGTH } from '@/shared/utils/addressValidation';
import { normalizePhoneInput } from '@/shared/utils/phoneValidation';

// ─── ShippingFields ──────────────────────────────────────────────────────────

export interface ShippingFields {
  name:        string;
  phone:       string;
  address:     string;
  /** Human-readable city name — maps to shippingCity in the API payload */
  cityName:    string;
  cityId:      number | null;
  zoneId:      number | null;
  areaId:      number | null;
  postalCode:  string;
  notes:       string;
}

// ─── Component ───────────────────────────────────────────────────────────────

interface ShippingFormProps {
  values:    ShippingFields;
  onChange:  (partial: Partial<ShippingFields>) => void;
  disabled?: boolean;
  /** Force single-column layout (default: 2-column pairs) */
  columns?:  1 | 2;
}

const labelStyle: React.CSSProperties = {
  display:       'block',
  fontSize:      '0.7rem',
  fontWeight:    600,
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  color:         'var(--on-surface-muted)',
  marginBottom:  '0.3rem',
};

const selectStyle: React.CSSProperties = {
  width:           '100%',
  padding:         '0.5rem 0.75rem',
  border:          '1px solid var(--border)',
  backgroundColor: 'var(--surface)',
  color:           'var(--on-surface)',
  fontSize:        '0.875rem',
  outline:         'none',
  cursor:          'pointer',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

/**
 * Shipping address form with cascading Pathao location dropdowns.
 * City → Zone → Area. Purely controlled — parent owns all field values.
 */
export default function ShippingForm({ values, onChange, disabled, columns = 2 }: ShippingFormProps) {
  const [cities, setCities] = useState<PathaoCityDto[]>([]);
  const [zones,  setZones]  = useState<PathaoZoneDto[]>([]);
  const [areas,  setAreas]  = useState<PathaoAreaDto[]>([]);

  const [citiesLoading, setCitiesLoading] = useState(true);
  const [zonesLoading,  setZonesLoading]  = useState(false);
  const [areasLoading,  setAreasLoading]  = useState(false);

  // Fetch cities on mount
  useEffect(() => {
    getCities()
      .then(setCities)
      .finally(() => setCitiesLoading(false));
  }, []);

  // Fetch zones whenever cityId changes
  useEffect(() => {
    if (values.cityId == null) { setZones([]); setAreas([]); return; }
    setZonesLoading(true);
    setZones([]);
    setAreas([]);
    getZones(values.cityId)
      .then(setZones)
      .finally(() => setZonesLoading(false));
  }, [values.cityId]);

  // Fetch areas whenever zoneId changes
  useEffect(() => {
    if (values.zoneId == null) { setAreas([]); return; }
    setAreasLoading(true);
    setAreas([]);
    getAreas(values.zoneId)
      .then(setAreas)
      .finally(() => setAreasLoading(false));
  }, [values.zoneId]);

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id   = e.target.value ? Number(e.target.value) : null;
    const name = id ? e.target.options[e.target.selectedIndex].text : '';
    onChange({ cityId: id, cityName: name, zoneId: null, areaId: null });
  };

  const handleZoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ zoneId: e.target.value ? Number(e.target.value) : null, areaId: null });
  };

  const handleAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ areaId: e.target.value ? Number(e.target.value) : null });
  };

  const textField = (key: keyof Pick<ShippingFields, 'name' | 'phone' | 'address' | 'postalCode' | 'notes'>) => ({
    value:    values[key] as string,
    disabled: disabled,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange({ [key]: e.target.value }),
  });

  const phoneField = {
    value: values.phone,
    disabled,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange({ phone: normalizePhoneInput(e.target.value) }),
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>

      {/* Name + Phone */}
      <div style={{ display: 'grid', gridTemplateColumns: columns === 1 ? '1fr' : '1fr 1fr', gap: '0.875rem' }}>
        <Field label="Full Name">
          <Input placeholder="Rahim Uddin" {...textField('name')} required />
        </Field>
        <Field label="Phone Number">
          <Input
            type="tel"
            placeholder="01XXXXXXXXX"
            inputMode="numeric"
            maxLength={11}
            pattern="[0-9]{11}"
            {...phoneField}
            required
          />
        </Field>
      </div>

      {/* Address */}
      <Field label="Address">
        <Input
          placeholder="House no., road, area"
          {...textField('address')}
          required
          minLength={ADDRESS_MIN_LENGTH}
          maxLength={ADDRESS_MAX_LENGTH}
        />
      </Field>

      {/* City dropdown */}
      <Field label="City *">
        <select
          style={{ ...selectStyle, opacity: disabled || citiesLoading ? 0.6 : 1 }}
          value={values.cityId ?? ''}
          onChange={handleCityChange}
          disabled={disabled || citiesLoading}
          required
        >
          <option value="">
            {citiesLoading ? 'Loading cities…' : 'Select city'}
          </option>
          {cities.map((c) => (
            <option key={c.cityId} value={c.cityId}>{c.cityName}</option>
          ))}
        </select>
      </Field>

      {/* Zone dropdown — visible once a city is picked */}
      {values.cityId != null && (
        <Field label="Zone *">
          <select
            style={{ ...selectStyle, opacity: disabled || zonesLoading ? 0.6 : 1 }}
            value={values.zoneId ?? ''}
            onChange={handleZoneChange}
            disabled={disabled || zonesLoading}
            required
          >
            <option value="">
              {zonesLoading ? 'Loading zones…' : 'Select zone'}
            </option>
            {zones.map((z) => (
              <option key={z.zoneId} value={z.zoneId}>{z.zoneName}</option>
            ))}
          </select>
        </Field>
      )}

      {/* Area dropdown — visible once a zone is picked */}
      {values.zoneId != null && (
        <Field label="Area *">
          <select
            style={{ ...selectStyle, opacity: disabled || areasLoading ? 0.6 : 1 }}
            value={values.areaId ?? ''}
            onChange={handleAreaChange}
            disabled={disabled || areasLoading}
            required
          >
            <option value="">
              {areasLoading ? 'Loading areas…' : 'Select area'}
            </option>
            {areas.map((a) => (
              <option key={a.areaId} value={a.areaId}>{a.areaName}</option>
            ))}
          </select>
        </Field>
      )}

      {/* Postal code + Notes */}
      <div style={{ display: 'grid', gridTemplateColumns: columns === 1 ? '1fr' : '1fr 1fr', gap: '0.875rem' }}>
        <Field label="Postal Code (optional)">
          <Input placeholder="1212" {...textField('postalCode')} />
        </Field>
        <Field label="Order Notes (optional)">
          <Input placeholder="Any special instructions…" {...textField('notes')} />
        </Field>
      </div>

    </div>
  );
}

