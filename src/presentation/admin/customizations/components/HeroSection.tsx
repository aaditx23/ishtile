import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { HeroImageRecord } from '@/application/customizations/heroCustomizations';
import type { HeroFieldSetter, HeroFormState } from './types';

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
  justifyContent: 'center',
  gap: '0.375rem',
  padding: '0.5rem 1rem',
  backgroundColor: 'var(--primary)',
  color: 'var(--on-primary)',
  border: 'none',
  cursor: 'pointer',
  fontSize: '0.8rem',
  fontWeight: 700,
};

interface HeroSectionProps {
  form: HeroFormState;
  editingId: string | null;
  submitLabel: string;
  submitting: boolean;
  uploading: boolean;
  loading: boolean;
  items: HeroImageRecord[];
  onSet: HeroFieldSetter;
  onUpload: (file: File | null) => Promise<void>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancelEdit: () => void;
  onEdit: (item: HeroImageRecord) => void;
  onToggle: (item: HeroImageRecord) => Promise<void>;
  onDelete: (item: HeroImageRecord) => Promise<void>;
}

export default function HeroSection({
  form,
  editingId,
  submitLabel,
  submitting,
  uploading,
  loading,
  items,
  onSet,
  onUpload,
  onSubmit,
  onCancelEdit,
  onEdit,
  onToggle,
  onDelete,
}: HeroSectionProps) {
  return (
    <>
      <HeroFormCard
        form={form}
        editingId={editingId}
        submitLabel={submitLabel}
        submitting={submitting}
        uploading={uploading}
        onSet={onSet}
        onUpload={onUpload}
        onSubmit={onSubmit}
        onCancelEdit={onCancelEdit}
      />

      <HeroListCard
        items={items}
        loading={loading}
        onEdit={onEdit}
        onToggle={onToggle}
        onDelete={onDelete}
      />
    </>
  );
}

function HeroFormCard({
  form,
  editingId,
  submitLabel,
  submitting,
  uploading,
  onSet,
  onUpload,
  onSubmit,
  onCancelEdit,
}: {
  form: HeroFormState;
  editingId: string | null;
  submitLabel: string;
  submitting: boolean;
  uploading: boolean;
  onSet: HeroFieldSetter;
  onUpload: (file: File | null) => Promise<void>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancelEdit: () => void;
}) {
  return (
    <div
      style={{
        border: '1px solid var(--border)',
        padding: '1.25rem',
        backgroundColor: 'var(--surface)',
      }}
    >
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{editingId ? 'Edit Hero Image' : 'Add Hero Image'}</h2>

        <div>
          <label style={labelStyle}>Upload Image</label>
          <input
            type="file"
            className="hero-upload-input"
            accept="image/*"
            onChange={(e) => {
              onUpload(e.target.files?.[0] ?? null);
              e.target.value = '';
            }}
            disabled={uploading || submitting}
            style={{ fontSize: '0.8rem' }}
          />
          {uploading ? (
            <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--on-surface-muted)' }}>Uploading image...</p>
          ) : null}
        </div>

        <div>
          <label style={labelStyle}>Image URL</label>
          <Input
            type="url"
            value={form.url}
            onChange={(e) => onSet('url', e.target.value)}
            required
            disabled={submitting}
            placeholder="https://..."
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Title</label>
            <Input
              type="text"
              value={form.title}
              onChange={(e) => onSet('title', e.target.value)}
              required
              disabled={submitting}
            />
          </div>

          <div>
            <label style={labelStyle}>Subtitle</label>
            <Input
              type="text"
              value={form.subtitle}
              onChange={(e) => onSet('subtitle', e.target.value)}
              disabled={submitting}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Content Position</label>
            <select
              value={form.contentPosition}
              onChange={(e) => onSet('contentPosition', e.target.value === 'right' ? 'right' : 'left')}
              disabled={submitting}
              style={{
                width: '100%',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--surface)',
                color: 'var(--on-surface)',
                fontSize: '0.85rem',
                padding: '0.5rem 0.625rem',
              }}
            >
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => onSet('isActive', e.target.checked)}
              disabled={submitting}
            />
            Active on homepage
          </label>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
          <input
            type="checkbox"
            checked={form.showButton}
            onChange={(e) => onSet('showButton', e.target.checked)}
            disabled={submitting}
          />
          Show button
        </label>

        {form.showButton ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Button Text</label>
              <Input
                type="text"
                value={form.buttonText}
                onChange={(e) => onSet('buttonText', e.target.value)}
                disabled={submitting}
                required={form.showButton}
              />
            </div>

            <div>
              <label style={labelStyle}>Button URL</label>
              <Input
                type="url"
                value={form.buttonUrl}
                onChange={(e) => onSet('buttonUrl', e.target.value)}
                disabled={submitting}
                required={form.showButton}
                placeholder="/products or https://..."
              />
            </div>
          </div>
        ) : null}

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Button type="submit" disabled={submitting || uploading} style={primaryBtn}>
            {submitting ? 'Saving...' : submitLabel}
          </Button>

          {editingId ? (
            <Button type="button" variant="outline" onClick={onCancelEdit} disabled={submitting || uploading}>
              Cancel Edit
            </Button>
          ) : null}
        </div>
      </form>
    </div>
  );
}

function HeroListCard({
  items,
  loading,
  onEdit,
  onToggle,
  onDelete,
}: {
  items: HeroImageRecord[];
  loading: boolean;
  onEdit: (item: HeroImageRecord) => void;
  onToggle: (item: HeroImageRecord) => Promise<void>;
  onDelete: (item: HeroImageRecord) => Promise<void>;
}) {
  return (
    <div
      style={{
        border: '1px solid var(--border)',
        backgroundColor: 'var(--surface)',
        padding: '1rem',
      }}
    >
      <h2 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>Hero Images</h2>

      {loading ? (
        <p style={{ color: 'var(--on-surface-muted)', fontSize: '0.85rem' }}>Loading...</p>
      ) : items.length === 0 ? (
        <p style={{ color: 'var(--on-surface-muted)', fontSize: '0.85rem' }}>No hero images yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                border: '1px solid var(--border)',
                padding: '0.75rem',
                display: 'grid',
                gridTemplateColumns: '4rem 1fr',
                gap: '0.75rem',
                alignItems: 'center',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt={item.title}
                style={{ width: '4rem', height: '3.25rem', objectFit: 'cover' }}
              />

              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>{item.title}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.subtitle || '-'}
                </p>
                <p style={{ fontSize: '0.72rem', color: 'var(--on-surface-muted)', marginTop: '0.35rem' }}>
                  {item.contentPosition.toUpperCase()} · {item.showButton ? 'Button On' : 'Button Off'} · {item.isActive ? 'Active' : 'Inactive'}
                </p>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  <Button type="button" variant="outline" onClick={() => onEdit(item)}>
                    Edit
                  </Button>
                  <Button type="button" variant="outline" onClick={() => onToggle(item)}>
                    {item.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => onDelete(item)}>
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
