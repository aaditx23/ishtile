'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import ShopLayout from '@/presentation/shared/layouts/ShopLayout';
import { AdminSidebarNav } from '../AdminLayout';
import AdminMobileNavStrip from '../components/AdminMobileNavStrip';
import {
  createHeroImage,
  deleteHeroImage,
  getSiteBranding,
  listHeroImages,
  setHeroImageActive,
  updateSiteBranding,
  updateHeroImage,
  uploadBrandLogo,
  uploadHeroImage,
  type HeroImageRecord,
  type SiteBranding,
} from '@/application/customizations/heroCustomizations';
import { buildUploadSizeError, splitFilesByUploadLimit } from '@/presentation/admin/utils/uploadValidation';
import BrandingSection from './components/BrandingSection';
import HeroSection from './components/HeroSection';
import {
  INITIAL_HERO_FORM,
  toHeroForm,
  toHeroPayload,
  type HeroFormState,
} from './components/types';

export default function AdminCustomizationsView() {
  const [items, setItems] = useState<HeroImageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [brandingSaving, setBrandingSaving] = useState(false);
  const [brandingUploading, setBrandingUploading] = useState(false);
  const [branding, setBranding] = useState<SiteBranding>({
    siteName: 'Ishtile',
    brandLogoUrl: null,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<HeroFormState>(INITIAL_HERO_FORM);

  const submitLabel = useMemo(() => (editingId ? 'Update Hero' : 'Add Hero'), [editingId]);

  async function loadData() {
    try {
      const [list, brandingData] = await Promise.all([listHeroImages(), getSiteBranding()]);
      setItems(list);
      setBranding(brandingData);
    } catch {
      toast.error('Failed to load customizations.');
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
    setForm(INITIAL_HERO_FORM);
  }

  async function onUpload(file: File | null) {
    if (!file) return;
    const { accepted, rejected } = splitFilesByUploadLimit([file]);
    if (rejected.length > 0) {
      toast.error(buildUploadSizeError(rejected));
      return;
    }
    const validFile = accepted[0];
    if (!validFile) return;
    setUploading(true);
    try {
      const url = await uploadHeroImage(validFile);
      set('url', url);
      toast.success('Image uploaded.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  async function onBrandLogoUpload(file: File | null) {
    if (!file) return;
    const { accepted, rejected } = splitFilesByUploadLimit([file]);
    if (rejected.length > 0) {
      toast.error(buildUploadSizeError(rejected));
      return;
    }
    const validFile = accepted[0];
    if (!validFile) return;
    setBrandingUploading(true);
    try {
      const url = await uploadBrandLogo(validFile);
      setBranding((prev) => ({ ...prev, brandLogoUrl: url }));
      toast.success('Brand logo uploaded.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Logo upload failed.');
    } finally {
      setBrandingUploading(false);
    }
  }

  async function handleBrandingSubmit(e: React.FormEvent) {
    e.preventDefault();
    const siteName = branding.siteName.trim();
    if (!siteName) {
      toast.error('Site name is required.');
      return;
    }

    setBrandingSaving(true);
    try {
      await updateSiteBranding({ siteName, brandLogoUrl: branding.brandLogoUrl });
      setBranding((prev) => ({ ...prev, siteName }));
      toast.success('Branding saved.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save branding.');
    } finally {
      setBrandingSaving(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const formEl = e.currentTarget as HTMLFormElement;
    if (!formEl.reportValidity()) return;

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
      const payload = toHeroPayload(form);
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
          <BrandingSection
            branding={branding}
            saving={brandingSaving}
            uploading={brandingUploading}
            onSetBranding={setBranding}
            onUpload={onBrandLogoUpload}
            onSubmit={handleBrandingSubmit}
          />

          <HeroSection
            form={form}
            editingId={editingId}
            submitLabel={submitLabel}
            submitting={submitting}
            uploading={uploading}
            loading={loading}
            items={items}
            onSet={set}
            onUpload={onUpload}
            onSubmit={handleSubmit}
            onCancelEdit={resetForm}
            onEdit={(item) => {
              setEditingId(item.id);
              setForm(toHeroForm(item));
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

            <BrandingSection
              branding={branding}
              saving={brandingSaving}
              uploading={brandingUploading}
              onSetBranding={setBranding}
              onUpload={onBrandLogoUpload}
              onSubmit={handleBrandingSubmit}
            />

            <HeroSection
              form={form}
              editingId={editingId}
              submitLabel={submitLabel}
              submitting={submitting}
              uploading={uploading}
              items={items}
              loading={loading}
              onSet={set}
              onUpload={onUpload}
              onSubmit={handleSubmit}
              onCancelEdit={resetForm}
              onEdit={(item) => {
                setEditingId(item.id);
                setForm(toHeroForm(item));
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
