import { Input } from '@/components/ui/input';

export interface ShippingFields {
  name:        string;
  phone:       string;
  address:     string;
  city:        string;
  postalCode:  string;
  notes:       string;
}

interface ShippingFormProps {
  values:    ShippingFields;
  onChange:  (fields: Partial<ShippingFields>) => void;
  disabled?: boolean;
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

/**
 * Shipping address form — purely controlled, no state inside.
 * Parent owns all field values.
 */
export default function ShippingForm({ values, onChange, disabled }: ShippingFormProps) {
  const field = (key: keyof ShippingFields) => ({
    value:    values[key],
    disabled: disabled,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange({ [key]: e.target.value }),
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
        <Field label="Full Name">
          <Input placeholder="Rahim Uddin" {...field('name')} required />
        </Field>
        <Field label="Phone Number">
          <Input type="tel" placeholder="01XXXXXXXXX" {...field('phone')} required />
        </Field>
      </div>

      <Field label="Address">
        <Input placeholder="House no., road, area" {...field('address')} required />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
        <Field label="City">
          <Input placeholder="Dhaka" {...field('city')} required />
        </Field>
        <Field label="Postal Code (optional)">
          <Input placeholder="1212" {...field('postalCode')} />
        </Field>
      </div>

      <Field label="Order Notes (optional)">
        <Input
          placeholder="Any special instructions…"
          {...field('notes')}
        />
      </Field>
    </div>
  );
}
