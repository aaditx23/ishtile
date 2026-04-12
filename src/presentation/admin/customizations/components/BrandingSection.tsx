import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { SiteBranding } from '@/application/customizations/heroCustomizations';

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

interface BrandingSectionProps {
  branding: SiteBranding;
  saving: boolean;
  uploading: boolean;
  onSetBranding: React.Dispatch<React.SetStateAction<SiteBranding>>;
  onUpload: (file: File | null) => Promise<void>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export default function BrandingSection({
  branding,
  saving,
  uploading,
  onSetBranding,
  onUpload,
  onSubmit,
}: BrandingSectionProps) {
  return (
    <div
      style={{
        border: '1px solid var(--border)',
        padding: '1.25rem',
        backgroundColor: 'var(--surface)',
      }}
    >
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Branding</h2>

        <div>
          <label style={labelStyle}>Site Name</label>
          <Input
            type="text"
            value={branding.siteName}
            onChange={(e) => onSetBranding((prev) => ({ ...prev, siteName: e.target.value }))}
            required
            disabled={saving}
            placeholder="Ishtile"
          />
          <p style={{ marginTop: '0.35rem', fontSize: '0.75rem', color: 'var(--on-surface-muted)' }}>
            Used as fallback text in the top navbar when no logo is set.
          </p>
        </div>

        <div>
          <label style={labelStyle}>Brand Logo</label>
          <input
            type="file"
            className="hero-upload-input"
            accept="image/png,image/svg+xml,image/webp,image/jpeg"
            onChange={(e) => {
              onUpload(e.target.files?.[0] ?? null);
              e.target.value = '';
            }}
            disabled={uploading || saving}
            style={{ fontSize: '0.8rem' }}
          />
          <p style={{ marginTop: '0.35rem', fontSize: '0.75rem', color: 'var(--on-surface-muted)' }}>
            Tip: Use a transparent PNG or SVG around 240x80 px (or close) and keep file size under 500 KB for best navbar rendering.
          </p>
          {uploading ? (
            <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--on-surface-muted)' }}>Uploading logo...</p>
          ) : null}

          {branding.brandLogoUrl ? (
            <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={branding.brandLogoUrl}
                alt="Brand logo preview"
                style={{
                  maxWidth: '10rem',
                  maxHeight: '3rem',
                  objectFit: 'contain',
                  border: '1px solid var(--border)',
                  padding: '0.25rem',
                  backgroundColor: 'var(--surface)',
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => onSetBranding((prev) => ({ ...prev, brandLogoUrl: null }))}
                disabled={saving || uploading}
              >
                Remove Logo
              </Button>
            </div>
          ) : null}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Button type="submit" disabled={saving || uploading} style={primaryBtn}>
            {saving ? 'Saving...' : 'Save Branding'}
          </Button>
        </div>
      </form>
    </div>
  );
}
