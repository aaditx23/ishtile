'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import ShopLayout from '@/presentation/shared/layouts/ShopLayout';
import { AdminSidebarNav } from './AdminLayout';
import AdminMobileNavStrip from './components/AdminMobileNavStrip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  createHeroImage,
  deleteHeroImage,
  listHeroImages,
  setHeroImageActive,
  updateHeroImage,
  uploadHeroImage,
  type HeroContentPosition,
  type HeroImagePayload,
  type HeroImageRecord,
} from '@/application/customizations/heroCustomizations';

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

interface HeroFormState {
  url: string;
  title: string;
  subtitle: string;
  contentPosition: HeroContentPosition;
  showButton: boolean;
  buttonText: string;
  buttonUrl: string;
  isActive: boolean;
}

const INITIAL_FORM: HeroFormState = {
  url: '',
  title: '',
  subtitle: '',
  contentPosition: 'left',
  showButton: false,
  buttonText: '',
  buttonUrl: '',
  isActive: true,
};

function toPayload(form: HeroFormState): HeroImagePayload {
  return {
    url: form.url.trim(),
    title: form.title.trim(),
    subtitle: form.subtitle,
    contentPosition: form.contentPosition,
    showButton: form.showButton,
    buttonText: form.buttonText,
    buttonUrl: form.buttonUrl,
    isActive: form.isActive,
  };
}

function toForm(record: HeroImageRecord): HeroFormState {
  return {
    url: record.url,
    title: record.title,
    subtitle: record.subtitle ?? '',
    contentPosition: record.contentPosition,
    showButton: record.showButton,
    buttonText: record.buttonText ?? '',
    buttonUrl: record.buttonUrl ?? '',
    isActive: record.isActive,
  };
}

export default function AdminCustomizationsView() {
  const [items, setItems] = useState<HeroImageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<HeroFormState>(INITIAL_FORM);

  const submitLabel = useMemo(() => (editingId ? 'Update Hero' : 'Add Hero'), [editingId]);

  async function loadData() {
    try {
      const list = await listHeroImages();
      setItems(list);
    } catch {
      toast.error('Failed to load hero images.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function set<K extends keyof HeroFormState>(key: K, value: HeroFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function resetForm() {
    setEditingId(null);
    setForm(INITIAL_FORM);
  }

  async function onUpload(file: File | null) {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadHeroImage(file);
      set('url', url);
      toast.success('Image uploaded.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.url.trim() || !form.title.trim()) {
      toast.error('Image URL and title are required.');
      return;
    }

    if (form.showButton && (!form.buttonText.trim() || !form.buttonUrl.trim())) {
      toast.error('Button text and URL are required when button is enabled.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = toPayload(form);
      if (editingId) {
        await updateHeroImage(editingId, payload);
        toast.success('Hero updated.');
      } else {
        await createHeroImage(payload);
        toast.success('Hero added.');
      }
      resetForm();
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save hero image.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggle(item: HeroImageRecord) {
    try {
      await setHeroImageActive(item.id, !item.isActive);
      setItems((prev) => prev.map((row) => (row.id === item.id ? { ...row, isActive: !row.isActive } : row)));
      toast.success(item.isActive ? 'Hero deactivated.' : 'Hero activated.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update active state.');
    }
  }

  async function handleDelete(item: HeroImageRecord) {
    if (!window.confirm(`Delete hero image \"${item.title}\"?`)) return;

    try {
      await deleteHeroImage(item.id);
      if (editingId === item.id) resetForm();
      setItems((prev) => prev.filter((row) => row.id !== item.id));
      toast.success('Hero deleted.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete hero image.');
    }
  }

  return (
    <ShopLayout>
      <div className="block lg:hidden" style={{ padding: '1.25rem 1rem' }}>
        <AdminMobileNavStrip activeHref="/admin/customizations" />

        <h1 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Customizations</h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <HeroFormCard
            form={form}
            editingId={editingId}
            submitLabel={submitLabel}
            submitting={submitting}
            uploading={uploading}
            onSet={set}
            onUpload={onUpload}
            onSubmit={handleSubmit}
            onCancelEdit={resetForm}
          />

          <HeroListCard
            items={items}
            loading={loading}
            onEdit={(item) => {
              setEditingId(item.id);
              setForm(toForm(item));
            }}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        </div>
      </div>

      <div
        className="hidden lg:grid"
        style={{
          maxWidth: '84rem',
          margin: '0 auto',
          padding: '2rem 1.25rem',
          gridTemplateColumns: '13rem 1fr',
          gap: '2rem',
          alignItems: 'start',
        }}
      >
        <AdminSidebarNav activeHref="/admin/customizations" />

        <main>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Customizations</h1>

            <HeroFormCard
              form={form}
              editingId={editingId}
              submitLabel={submitLabel}
              submitting={submitting}
              uploading={uploading}
              onSet={set}
              onUpload={onUpload}
              onSubmit={handleSubmit}
              onCancelEdit={resetForm}
            />

            <HeroListCard
              items={items}
              loading={loading}
              onEdit={(item) => {
                setEditingId(item.id);
                setForm(toForm(item));
              }}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          </div>
        </main>
      </div>
    </ShopLayout>
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
  onSet: <K extends keyof HeroFormState>(key: K, value: HeroFormState[K]) => void;
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
            onChange={(e) => onUpload(e.target.files?.[0] ?? null)}
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
                  {item.subtitle || '—'}
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
