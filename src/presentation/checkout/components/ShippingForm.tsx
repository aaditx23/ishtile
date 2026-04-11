'use client';

import { Input } from '@/components/ui/input';
import { ADDRESS_MAX_LENGTH, ADDRESS_MIN_LENGTH } from '@/shared/utils/addressValidation';
import { normalizePhoneInput } from '@/shared/utils/phoneValidation';

// ─── ShippingFields ──────────────────────────────────────────────────────────

export interface ShippingFields {
  name:       string;
  phone:      string;
  address:    string;
  postalCode: string;
  notes:      string;
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

export default function ShippingForm({ values, onChange, disabled, columns = 2 }: ShippingFormProps) {
  const textField = (key: keyof Pick<ShippingFields, 'name' | 'phone' | 'address' | 'postalCode' | 'notes'>) => ({
    value:    values[key] as string,
    disabled,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange({ [key]: e.target.value }),
  });

  const phoneField = {
    value: values.phone,
    disabled,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange({ phone: normalizePhoneInput(e.target.value) }),
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
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

      <Field label="Address">
        <Input
          placeholder="House no., road, area"
          {...textField('address')}
          required
          minLength={ADDRESS_MIN_LENGTH}
          maxLength={ADDRESS_MAX_LENGTH}
        />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: columns === 1 ? '1fr' : '1fr 1fr', gap: '0.875rem' }}>
        <Field label="Postal Code (optional)">
          <Input placeholder="1212" {...textField('postalCode')} />
        </Field>
        <Field label="Order Notes (optional)">
          <Input placeholder="Any special instructions..." {...textField('notes')} />
        </Field>
      </div>
    </div>
  );
}

