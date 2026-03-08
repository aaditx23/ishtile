'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getAddresses } from '@/application/address/addresses';
import type { UserAddressDto } from '@/shared/types/api.types';
import type { ShippingFields } from './ShippingForm';

interface AddressPickerProps {
  onSelect: (fields: Partial<ShippingFields> | null) => void;
  disabled?: boolean;
}

export default function AddressPicker({ onSelect, disabled }: AddressPickerProps) {
  const [addresses, setAddresses] = useState<UserAddressDto[]>([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState<number | 'new' | null>(null);

  useEffect(() => {
    getAddresses()
      .then((list) => {
        setAddresses(list);
        if (list.length === 0) {
          // No saved addresses — go straight to the new-address form
          setSelected('new');
          onSelect(null);
          return;
        }
        // Auto-select default address if present
        const def = list.find(a => a.isDefault) ?? list[0];
        setSelected(def.id);
        onSelect(addressToFields(def));
      })
      .catch(() => toast.error('Could not load saved addresses.'))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = (id: number | 'new') => {
    setSelected(id);
    if (id === 'new') {
      onSelect(null);
    } else {
      const addr = addresses.find(a => a.id === id);
      if (addr) onSelect(addressToFields(addr));
    }
  };

  if (loading) return <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-muted)' }}>Loading saved addresses…</p>;
  // No saved addresses — the parent shows the form directly, nothing to render here
  if (addresses.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1rem' }}>
      {addresses.map(addr => (
        <label
          key={addr.id}
          style={{
            display:         'flex',
            alignItems:      'flex-start',
            gap:             '0.625rem',
            padding:         '0.75rem 1rem',
            border:          `1px solid ${selected === addr.id ? 'var(--primary)' : 'var(--border)'}`,
            borderRadius:    '0.625rem',
            cursor:          disabled ? 'not-allowed' : 'pointer',
            backgroundColor: selected === addr.id ? 'color-mix(in srgb, var(--primary) 8%, transparent)' : 'var(--surface)',
          }}
        >
          <input
            type="radio"
            name="saved-address"
            value={addr.id}
            checked={selected === addr.id}
            onChange={() => handleSelect(addr.id)}
            disabled={disabled}
            style={{ marginTop: '0.15rem', accentColor: 'var(--primary)' }}
          />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {addr.name && <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{addr.name}</span>}
              {addr.phone && <span style={{ fontSize: '0.8rem', color: 'var(--on-surface-muted)' }}>{addr.phone}</span>}
              {addr.isDefault && (
                <span style={{ marginLeft: 'auto', fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.45rem', borderRadius: '9999px', backgroundColor: '#d1fae5', color: '#065f46', textTransform: 'uppercase' }}>
                  Default
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-muted)', margin: 0 }}>
              {addr.addressLine}
              {addr.area ? `, ${addr.area}` : ''}
              {`, ${addr.city}`}
              {addr.postalCode ? ` - ${addr.postalCode}` : ''}
            </p>
          </div>
        </label>
      ))}

      {/* New address option */}
      <label
        style={{
          display:         'flex',
          alignItems:      'center',
          gap:             '0.625rem',
          padding:         '0.75rem 1rem',
          border:          `1px solid ${selected === 'new' ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius:    '0.625rem',
          cursor:          disabled ? 'not-allowed' : 'pointer',
          backgroundColor: selected === 'new' ? 'color-mix(in srgb, var(--primary) 8%, transparent)' : 'var(--surface)',
          fontSize:        '0.875rem',
        }}
      >
        <input
          type="radio"
          name="saved-address"
          value="new"
          checked={selected === 'new'}
          onChange={() => handleSelect('new')}
          disabled={disabled}
          style={{ accentColor: 'var(--primary)' }}
        />
        Enter a new address
      </label>
    </div>
  );
}

function addressToFields(addr: UserAddressDto): Partial<ShippingFields> {
  return {
    name:      addr.name      ?? '',
    phone:     addr.phone     ?? '',
    address:   addr.addressLine,
    cityName:  addr.city,
    cityId:    addr.cityId,
    zoneId:    addr.zoneId,
    areaId:    addr.areaId,
    postalCode: addr.postalCode ?? '',
  };
}
