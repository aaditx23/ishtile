'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import ShopLayout from '@/presentation/shared/layouts/ShopLayout';
import { AdminSidebarNav } from './AdminLayout';
import AdminMobileNavStrip from './components/AdminMobileNavStrip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Lookbook } from '@/domain/lookbook/lookbook.entity';
import {
  createLookbook,
  deleteLookbook,
  listLookbooksForAdmin,
  updateLookbook,
  uploadLookbookImages,
} from '@/application/lookbook/adminLookbooks';
import { buildUploadSizeError, splitFilesByUploadLimit } from '@/presentation/admin/utils/uploadValidation';

const labelStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'var(--on-surface-muted)',
  marginBottom: '0.375rem',
  display: 'block',
};

interface LookbookFormState {
  title: string;
  slug: string;
  body: string;
  coverImageUrl: string;
  imageUrls: string[];
  displayOrder: number;
  isActive: boolean;
}

const INITIAL_FORM: LookbookFormState = {
  title: '',
  slug: '',
  body: '',
  coverImageUrl: '',
  imageUrls: [],
  displayOrder: 0,
  isActive: true,
};

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
}

function toForm(item: Lookbook): LookbookFormState {
  return {
    title: item.title,
    slug: item.slug,
    body: item.body ?? '',
    coverImageUrl: item.coverImageUrl,
    imageUrls: item.imageUrls,
    displayOrder: item.displayOrder,
    isActive: item.isActive,
  };
}

export default function AdminLookbooksView() {
  const [items, setItems] = useState<Lookbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingAlbum, setUploadingAlbum] = useState(false);
  const [newCoverFile, setNewCoverFile] = useState<File | null>(null);
  const [newAlbumFiles, setNewAlbumFiles] = useState<File[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<LookbookFormState>(INITIAL_FORM);

  const submitLabel = useMemo(() => (editingId ? 'Update Lookbook' : 'Add Lookbook'), [editingId]);

  async function loadData() {
    try {
      const list = await listLookbooksForAdmin();
      setItems(list);
    } catch {
      toast.error('Failed to load lookbooks.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function set<K extends keyof LookbookFormState>(key: K, value: LookbookFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function resetForm() {
    setEditingId(null);
    setNewCoverFile(null);
    setNewAlbumFiles([]);
    setForm(INITIAL_FORM);
  }

  function handleCoverSelect(file: File | null) {
    if (!file) return;
    const { accepted, rejected } = splitFilesByUploadLimit([file]);
    if (rejected.length > 0) {
      toast.error(buildUploadSizeError(rejected));
      return;
    }
    if (accepted[0]) {
      setNewCoverFile(accepted[0]);
    }
  }

  function handleAlbumSelect(files: FileList | null) {
    if (!files || files.length === 0) return;
    const { accepted, rejected } = splitFilesByUploadLimit(Array.from(files));
    if (rejected.length > 0) {
      toast.error(buildUploadSizeError(rejected));
    }
    if (accepted.length > 0) {
      setNewAlbumFiles((prev) => [...prev, ...accepted]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.title.trim() || !form.slug.trim()) {
      toast.error('Title, slug, and cover image are required.');
      return;
    }

    setSubmitting(true);
    try {
      let finalCoverUrl = form.coverImageUrl;
      if (newCoverFile) {
        setUploadingCover(true);
        const [uploadedCover] = await uploadLookbookImages([newCoverFile]);
        if (!uploadedCover) throw new Error('Cover upload failed');
        finalCoverUrl = uploadedCover;
        set('coverImageUrl', uploadedCover);
        setNewCoverFile(null);
      }

      if (!finalCoverUrl.trim()) {
        toast.error('Title, slug, and cover image are required.');
        return;
      }

      let finalAlbumUrls = form.imageUrls;
      if (newAlbumFiles.length > 0) {
        setUploadingAlbum(true);
        const uploaded = await uploadLookbookImages(newAlbumFiles);
        finalAlbumUrls = [...form.imageUrls, ...uploaded];
        set('imageUrls', finalAlbumUrls);
        setNewAlbumFiles([]);
      }

      if (finalAlbumUrls.length === 0) {
        toast.error('Please add at least one album image.');
        return;
      }

      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        body: form.body.trim(),
        coverImageUrl: finalCoverUrl.trim(),
        imageUrls: finalAlbumUrls,
        displayOrder: Number.isFinite(form.displayOrder) ? form.displayOrder : 0,
        isActive: form.isActive,
      };

      if (editingId) {
        await updateLookbook(editingId, payload);
        toast.success('Lookbook updated.');
      } else {
        await createLookbook(payload);
        toast.success('Lookbook created.');
      }

      resetForm();
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save lookbook.');
    } finally {
      setUploadingCover(false);
      setUploadingAlbum(false);
      setSubmitting(false);
    }
  }

  async function handleDelete(item: Lookbook) {
    if (!window.confirm(`Delete lookbook \"${item.title}\"?`)) return;
    try {
      await deleteLookbook(item.id);
      if (editingId === item.id) resetForm();
      setItems((prev) => prev.filter((x) => x.id !== item.id));
      toast.success('Lookbook deleted.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete lookbook.');
    }
  }

  return (
    <ShopLayout>
      <div className="block lg:hidden" style={{ padding: '1.25rem 1rem' }}>
        <AdminMobileNavStrip activeHref="/admin/lookbooks" />
        <h1 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Lookbooks</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <LookbookFormCard
            form={form}
            editingId={editingId}
            submitLabel={submitLabel}
            submitting={submitting}
            uploadingCover={uploadingCover}
            uploadingAlbum={uploadingAlbum}
            newCoverFile={newCoverFile}
            newAlbumFiles={newAlbumFiles}
            onSet={set}
            onCoverSelect={handleCoverSelect}
            onAlbumSelect={handleAlbumSelect}
            onSubmit={handleSubmit}
            onCancelEdit={resetForm}
            onRemoveCoverImage={() => set('coverImageUrl', '')}
            onRemovePendingCoverImage={() => setNewCoverFile(null)}
            onRemoveAlbumImage={(idx) => set('imageUrls', form.imageUrls.filter((_, i) => i !== idx))}
            onRemovePendingAlbumImage={(idx) => setNewAlbumFiles((prev) => prev.filter((_, i) => i !== idx))}
          />

          <LookbookListCard
            items={items}
            loading={loading}
            onEdit={(item) => {
              setEditingId(item.id);
              setNewCoverFile(null);
              setNewAlbumFiles([]);
              setForm(toForm(item));
            }}
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
        <AdminSidebarNav activeHref="/admin/lookbooks" />
        <main>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Lookbooks</h1>

            <LookbookFormCard
              form={form}
              editingId={editingId}
              submitLabel={submitLabel}
              submitting={submitting}
              uploadingCover={uploadingCover}
              uploadingAlbum={uploadingAlbum}
              newCoverFile={newCoverFile}
              newAlbumFiles={newAlbumFiles}
              onSet={set}
              onCoverSelect={handleCoverSelect}
              onAlbumSelect={handleAlbumSelect}
              onSubmit={handleSubmit}
              onCancelEdit={resetForm}
              onRemoveCoverImage={() => set('coverImageUrl', '')}
              onRemovePendingCoverImage={() => setNewCoverFile(null)}
              onRemoveAlbumImage={(idx) => set('imageUrls', form.imageUrls.filter((_, i) => i !== idx))}
              onRemovePendingAlbumImage={(idx) => setNewAlbumFiles((prev) => prev.filter((_, i) => i !== idx))}
            />

            <LookbookListCard
              items={items}
              loading={loading}
              onEdit={(item) => {
                setEditingId(item.id);
                setNewCoverFile(null);
                setNewAlbumFiles([]);
                setForm(toForm(item));
              }}
              onDelete={handleDelete}
            />
          </div>
        </main>
      </div>
    </ShopLayout>
  );
}

function LookbookFormCard({
  form,
  editingId,
  submitLabel,
  submitting,
  uploadingCover,
  uploadingAlbum,
  newCoverFile,
  newAlbumFiles,
  onSet,
  onCoverSelect,
  onAlbumSelect,
  onSubmit,
  onCancelEdit,
  onRemoveCoverImage,
  onRemovePendingCoverImage,
  onRemoveAlbumImage,
  onRemovePendingAlbumImage,
}: {
  form: LookbookFormState;
  editingId: number | null;
  submitLabel: string;
  submitting: boolean;
  uploadingCover: boolean;
  uploadingAlbum: boolean;
  newCoverFile: File | null;
  newAlbumFiles: File[];
  onSet: <K extends keyof LookbookFormState>(key: K, value: LookbookFormState[K]) => void;
  onCoverSelect: (file: File | null) => void;
  onAlbumSelect: (files: FileList | null) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancelEdit: () => void;
  onRemoveCoverImage: () => void;
  onRemovePendingCoverImage: () => void;
  onRemoveAlbumImage: (idx: number) => void;
  onRemovePendingAlbumImage: (idx: number) => void;
}) {
  return (
    <div style={{ border: '1px solid var(--border)', padding: '1.25rem', backgroundColor: 'var(--surface)' }}>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{editingId ? 'Edit Lookbook' : 'Add Lookbook'}</h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Title</label>
            <Input
              value={form.title}
              onChange={(e) => {
                onSet('title', e.target.value);
                onSet('slug', slugify(e.target.value));
              }}
              disabled={submitting}
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Slug</label>
            <Input value={form.slug} disabled={submitting} readOnly required />
          </div>

          <div>
            <label style={labelStyle}>Body</label>
            <textarea
              value={form.body}
              onChange={(e) => onSet('body', e.target.value)}
              rows={4}
              disabled={submitting}
              style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--border)', fontSize: '0.875rem', resize: 'vertical', backgroundColor: 'var(--surface)', color: 'inherit', fontFamily: 'inherit' }}
            />
          </div>

          <div>
            <label style={labelStyle}>Display Order</label>
            <Input
              type="number"
              value={String(form.displayOrder)}
              onChange={(e) => onSet('displayOrder', Number(e.target.value || 0))}
              disabled={submitting}
            />
          </div>

          <div>
            <label style={labelStyle}>Cover Image</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {form.coverImageUrl ? (
                <div style={{ position: 'relative', width: '4rem', height: '4rem', overflow: 'hidden', border: '1px solid var(--border)', flexShrink: 0 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.coverImageUrl} alt="Cover image" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    type="button"
                    onClick={onRemoveCoverImage}
                    disabled={submitting}
                    style={{ position: 'absolute', top: '2px', right: '2px', width: '1.1rem', height: '1.1rem', backgroundColor: 'rgba(0,0,0,0.55)', color: '#fff', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', fontSize: '0.65rem', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    aria-label="Remove cover image"
                  >
                    &times;
                  </button>
                </div>
              ) : null}

              {newCoverFile ? (
                <div style={{ position: 'relative', width: '4rem', height: '4rem', overflow: 'hidden', border: '2px dashed var(--primary)', flexShrink: 0 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={URL.createObjectURL(newCoverFile)} alt={newCoverFile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    type="button"
                    onClick={onRemovePendingCoverImage}
                    disabled={submitting}
                    style={{ position: 'absolute', top: '2px', right: '2px', width: '1.1rem', height: '1.1rem', backgroundColor: 'rgba(0,0,0,0.55)', color: '#fff', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', fontSize: '0.65rem', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    aria-label="Remove new cover image"
                  >
                    &times;
                  </button>
                </div>
              ) : null}

              {!form.coverImageUrl && !newCoverFile ? (
                <label
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '4rem', height: '4rem', border: '2px dashed var(--border)', cursor: submitting ? 'not-allowed' : 'pointer', backgroundColor: 'var(--surface-muted)', color: 'var(--on-surface-muted)', fontSize: '1.5rem', flexShrink: 0, lineHeight: 1 }}
                >
                  +
                  <input
                    type="file"
                    accept="image/*"
                    disabled={submitting}
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      onCoverSelect(e.target.files?.[0] ?? null);
                      e.target.value = '';
                    }}
                  />
                </label>
              ) : null}
            </div>
            {uploadingCover ? <p style={{ marginTop: '0.35rem', fontSize: '0.75rem', color: 'var(--on-surface-muted)' }}>Uploading cover...</p> : null}
          </div>

          <div>
            <label style={labelStyle}>Album Images ({form.imageUrls.length + newAlbumFiles.length})</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {form.imageUrls.map((url, idx) => (
                <div key={`${url}-${idx}`} style={{ position: 'relative', width: '4rem', height: '4rem', overflow: 'hidden', border: '1px solid var(--border)', flexShrink: 0 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Album ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    type="button"
                    onClick={() => onRemoveAlbumImage(idx)}
                    disabled={submitting}
                    style={{ position: 'absolute', top: '2px', right: '2px', width: '1.1rem', height: '1.1rem', backgroundColor: 'rgba(0,0,0,0.55)', color: '#fff', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', fontSize: '0.65rem', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    aria-label="Remove image"
                  >
                    &times;
                  </button>
                </div>
              ))}

              {newAlbumFiles.map((file, idx) => (
                <div key={`new-${idx}`} style={{ position: 'relative', width: '4rem', height: '4rem', overflow: 'hidden', border: '2px dashed var(--primary)', flexShrink: 0 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={URL.createObjectURL(file)} alt={file.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    type="button"
                    onClick={() => onRemovePendingAlbumImage(idx)}
                    disabled={submitting}
                    style={{ position: 'absolute', top: '2px', right: '2px', width: '1.1rem', height: '1.1rem', backgroundColor: 'rgba(0,0,0,0.55)', color: '#fff', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', fontSize: '0.65rem', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    aria-label="Remove new image"
                  >
                    &times;
                  </button>
                </div>
              ))}

              <label
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '4rem', height: '4rem', border: '2px dashed var(--border)', cursor: submitting ? 'not-allowed' : 'pointer', backgroundColor: 'var(--surface-muted)', color: 'var(--on-surface-muted)', fontSize: '1.5rem', flexShrink: 0, lineHeight: 1 }}
              >
                +
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={submitting}
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    onAlbumSelect(e.target.files);
                    e.target.value = '';
                  }}
                />
              </label>
            </div>
            {uploadingAlbum ? <p style={{ marginTop: '0.35rem', fontSize: '0.75rem', color: 'var(--on-surface-muted)' }}>Uploading album...</p> : null}
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.isActive} onChange={(e) => onSet('isActive', e.target.checked)} disabled={submitting} />
            Active
          </label>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Button type="submit" disabled={submitting || uploadingCover || uploadingAlbum}>
            {submitting ? 'Saving...' : submitLabel}
          </Button>
          {editingId ? (
            <Button type="button" variant="outline" onClick={onCancelEdit} disabled={submitting}>
              Cancel Edit
            </Button>
          ) : null}
        </div>
      </form>
    </div>
  );
}

function LookbookListCard({
  items,
  loading,
  onEdit,
  onDelete,
}: {
  items: Lookbook[];
  loading: boolean;
  onEdit: (item: Lookbook) => void;
  onDelete: (item: Lookbook) => Promise<void>;
}) {
  return (
    <div style={{ border: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}>
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Lookbooks</h2>
      </div>

      {loading ? (
        <p style={{ padding: '1rem 1.25rem', color: 'var(--on-surface-muted)' }}>Loading lookbooks...</p>
      ) : items.length === 0 ? (
        <p style={{ padding: '1rem 1.25rem', color: 'var(--on-surface-muted)' }}>No lookbooks yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {items.map((item) => (
            <div key={item.id} style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border)', display: 'grid', gap: '0.6rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.8rem', alignItems: 'start' }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.title}</p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--on-surface-muted)', marginTop: '0.2rem' }}>
                    /lookbook/{item.slug} · {item.imageUrls.length} album images · {item.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <button type="button" onClick={() => onEdit(item)} style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.35rem 0.65rem', border: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}>
                    Edit
                  </button>
                  <button type="button" onClick={() => onDelete(item)} style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.35rem 0.65rem', border: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
