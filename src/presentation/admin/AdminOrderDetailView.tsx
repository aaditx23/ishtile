'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import ShopLayout from '@/presentation/shared/layouts/ShopLayout';
import { AdminSidebarNav } from './AdminLayout';
import AdminMobileNavStrip from './components/AdminMobileNavStrip';
import OrderSummaryCard from '@/presentation/orders/components/OrderSummaryCard';
import OrderStatusSelector from './components/OrderStatusSelector';
import DeliveryManagementCard from './components/DeliveryManagementCard';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { getAdminOrder } from '@/application/order/getAdminOrder';
import { generateMemo } from '@/application/order/generateMemo';
import { updateCustomerNotes } from '@/application/order/updateCustomerNotes';
import { updateOrderShipping } from '@/application/order/updateOrderShipping';
import { getCities } from '@/application/location/getCities';
import { getZones } from '@/application/location/getZones';
import { getAreas } from '@/application/location/getAreas';
import type { PathaoAreaDto, PathaoCityDto, PathaoZoneDto } from '@/shared/types/api.types';
import type { Order } from '@/domain/order/order.entity';

const sectionStyle: React.CSSProperties = {
  border:          '1px solid var(--border)',
  padding:         '1.25rem',
  backgroundColor: 'var(--surface)',
};

const headingStyle: React.CSSProperties = {
  fontSize:      '0.7rem',
  fontWeight:    700,
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  color:         'var(--on-surface-muted)',
  marginBottom:  '1rem',
};

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  border: '1px solid var(--border)',
  backgroundColor: 'var(--surface)',
  color: 'var(--on-surface)',
  fontSize: '0.875rem',
  outline: 'none',
};

interface ShippingFormState {
  shippingName: string;
  shippingPhone: string;
  shippingAddressLine: string;
  shippingPostalCode: string;
  shippingCity: string;
  shippingCityId: number | null;
  shippingZoneId: number | null;
  shippingZoneName: string;
  shippingAreaId: number | null;
  shippingAreaName: string;
}

function makeShippingForm(order: Order): ShippingFormState {
  return {
    shippingName: order.shippingName ?? '',
    shippingPhone: order.shippingPhone ?? '',
    shippingAddressLine: order.shippingAddressLine ?? order.shippingAddress ?? '',
    shippingPostalCode: order.shippingPostalCode ?? '',
    shippingCity: order.shippingCity ?? '',
    shippingCityId: order.shippingCityId ?? null,
    shippingZoneId: order.shippingZoneId ?? null,
    shippingZoneName: order.shippingZoneName ?? '',
    shippingAreaId: order.shippingAreaId ?? null,
    shippingAreaName: order.shippingAreaName ?? '',
  };
}

function ShippingDetailsEditor({ order, onOrderChange }: { order: Order; onOrderChange: (next: Order) => void }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ShippingFormState>(() => makeShippingForm(order));

  const [cities, setCities] = useState<PathaoCityDto[]>([]);
  const [zones, setZones] = useState<PathaoZoneDto[]>([]);
  const [areas, setAreas] = useState<PathaoAreaDto[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [zonesLoading, setZonesLoading] = useState(false);
  const [areasLoading, setAreasLoading] = useState(false);

  useEffect(() => {
    if (!editing) {
      setForm(makeShippingForm(order));
    }
  }, [editing, order]);

  useEffect(() => {
    if (!editing) return;
    let cancelled = false;
    setCitiesLoading(true);
    getCities()
      .then((list) => {
        if (!cancelled) setCities(list);
      })
      .finally(() => {
        if (!cancelled) setCitiesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [editing]);

  useEffect(() => {
    if (!editing || form.shippingCityId == null) {
      setZones([]);
      return;
    }
    let cancelled = false;
    setZonesLoading(true);
    getZones(form.shippingCityId)
      .then((list) => {
        if (!cancelled) setZones(list);
      })
      .finally(() => {
        if (!cancelled) setZonesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [editing, form.shippingCityId]);

  useEffect(() => {
    if (!editing || form.shippingZoneId == null) {
      setAreas([]);
      return;
    }
    let cancelled = false;
    setAreasLoading(true);
    getAreas(form.shippingZoneId)
      .then((list) => {
        if (!cancelled) setAreas(list);
      })
      .finally(() => {
        if (!cancelled) setAreasLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [editing, form.shippingZoneId]);

  const handleSave = async () => {
    if (!form.shippingName.trim() || !form.shippingPhone.trim() || !form.shippingAddressLine.trim()) {
      toast.error('Recipient name, phone, and address are required.');
      return;
    }
    if (!form.shippingCityId || !form.shippingZoneId || !form.shippingAreaId) {
      toast.error('City, zone, and area are required for Pathao shipping.');
      return;
    }

    setSaving(true);
    try {
      const next = await updateOrderShipping(order.id, {
        shippingName: form.shippingName.trim(),
        shippingPhone: form.shippingPhone.trim(),
        shippingAddress: form.shippingAddressLine.trim(),
        shippingAddressLine: form.shippingAddressLine.trim(),
        shippingPostalCode: form.shippingPostalCode.trim() || null,
        shippingCity: form.shippingCity,
        shippingCityId: form.shippingCityId,
        shippingZoneId: form.shippingZoneId,
        shippingZoneName: form.shippingZoneName || null,
        shippingAreaId: form.shippingAreaId,
        shippingAreaName: form.shippingAreaName || null,
      });
      onOrderChange(next);
      setEditing(false);
      toast.success('Shipping details updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update shipping details');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={sectionStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <p style={headingStyle}>Shipping Details</p>
        {!editing ? (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            Edit
          </Button>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="outline" size="sm" onClick={() => setEditing(false)} disabled={saving}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        )}
      </div>

      {!editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.875rem' }}>
          <p><strong>Name:</strong> {order.shippingName || '—'}</p>
          <p><strong>Phone:</strong> {order.shippingPhone || '—'}</p>
          <p><strong>Address:</strong> {order.shippingAddressLine || order.shippingAddress || '—'}</p>
          <p><strong>Postal:</strong> {order.shippingPostalCode || '—'}</p>
          <p><strong>City ID:</strong> {order.shippingCityId ?? '—'}</p>
          <p><strong>Zone ID:</strong> {order.shippingZoneId ?? '—'}</p>
          <p><strong>Area ID:</strong> {order.shippingAreaId ?? '—'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Recipient Name</label>
            <Input value={form.shippingName} onChange={(e) => setForm((p) => ({ ...p, shippingName: e.target.value }))} disabled={saving} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Phone Number</label>
            <Input value={form.shippingPhone} onChange={(e) => setForm((p) => ({ ...p, shippingPhone: e.target.value }))} disabled={saving} />
          </div>
          <div className="md:col-span-2">
            <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Address</label>
            <Input value={form.shippingAddressLine} onChange={(e) => setForm((p) => ({ ...p, shippingAddressLine: e.target.value }))} disabled={saving} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Postal Code</label>
            <Input value={form.shippingPostalCode} onChange={(e) => setForm((p) => ({ ...p, shippingPostalCode: e.target.value }))} disabled={saving} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>City</label>
            <select
              style={{ ...selectStyle, opacity: citiesLoading || saving ? 0.6 : 1 }}
              value={form.shippingCityId ?? ''}
              onChange={(e) => {
                const id = e.target.value ? Number(e.target.value) : null;
                const cityName = id ? e.target.options[e.target.selectedIndex].text : '';
                setForm((p) => ({
                  ...p,
                  shippingCityId: id,
                  shippingCity: cityName,
                  shippingZoneId: null,
                  shippingZoneName: '',
                  shippingAreaId: null,
                  shippingAreaName: '',
                }));
              }}
              disabled={citiesLoading || saving}
            >
              <option value="">{citiesLoading ? 'Loading…' : 'Select city'}</option>
              {cities.map((city) => (
                <option key={city.cityId} value={city.cityId}>{city.cityName}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Zone</label>
            <select
              style={{ ...selectStyle, opacity: !form.shippingCityId || zonesLoading || saving ? 0.6 : 1 }}
              value={form.shippingZoneId ?? ''}
              onChange={(e) => {
                const id = e.target.value ? Number(e.target.value) : null;
                const zoneName = id ? e.target.options[e.target.selectedIndex].text : '';
                setForm((p) => ({ ...p, shippingZoneId: id, shippingZoneName: zoneName, shippingAreaId: null, shippingAreaName: '' }));
              }}
              disabled={!form.shippingCityId || zonesLoading || saving}
            >
              <option value="">{zonesLoading ? 'Loading…' : 'Select zone'}</option>
              {zones.map((zone) => (
                <option key={zone.zoneId} value={zone.zoneId}>{zone.zoneName}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Area</label>
            <select
              style={{ ...selectStyle, opacity: !form.shippingZoneId || areasLoading || saving ? 0.6 : 1 }}
              value={form.shippingAreaId ?? ''}
              onChange={(e) => {
                const id = e.target.value ? Number(e.target.value) : null;
                const areaName = id ? e.target.options[e.target.selectedIndex].text : '';
                setForm((p) => ({ ...p, shippingAreaId: id, shippingAreaName: areaName }));
              }}
              disabled={!form.shippingZoneId || areasLoading || saving}
            >
              <option value="">{areasLoading ? 'Loading…' : 'Select area'}</option>
              {areas.map((area) => (
                <option key={area.areaId} value={area.areaId}>{area.areaName}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminOrderDetailView() {
  const params                  = useParams<{ id: string }>();
  const [order, setOrder]         = useState<Order | null>(null);
  const [loading, setLoading]     = useState(true);
  const [notFound, setNotFound]   = useState(false);
  const [memoLoading, setMemoLoading]     = useState(false);
  const [notesDraft, setNotesDraft]       = useState<string | null>(null); // null = not editing
  const [notesSaving, setNotesSaving]     = useState(false);

  // Sync draft when order loads
  useEffect(() => { if (order) setNotesDraft(null); }, [order?.id]);

  const handleGenerateMemo = async () => {
    if (!order) return;
    setMemoLoading(true);
    try {
      const filename = await generateMemo(order.id);
      toast.success(`Invoice downloaded: ${filename}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate memo.');
    } finally {
      setMemoLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!order || notesDraft === null) return;
    setNotesSaving(true);
    try {
      await updateCustomerNotes(order.id as unknown as string, notesDraft);
      setOrder((o) => o ? { ...o, customerNotes: notesDraft || null } : o);
      setNotesDraft(null);
      toast.success('Notes updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save notes');
    } finally {
      setNotesSaving(false);
    }
  };

  useEffect(() => {
    // Note: params.id is a Convex ID string, but domain expects number type.
    const orderId = params.id as unknown as number;
    if (!orderId) { setNotFound(true); setLoading(false); return; }
    getAdminOrder(orderId)
      .then((o) => { if (!o) { setNotFound(true); } else { setOrder(o); } })
      .catch(() => toast.error('Failed to load order.'))
      .finally(() => setLoading(false));
  }, [params.id]);

  return (
    <ShopLayout>
      {/* Mobile-only nav */}
      <div className="lg:hidden" style={{ padding: '1.25rem 1rem 0' }}>
        <AdminMobileNavStrip activeHref="/admin/orders" />
      </div>

      <div style={{ maxWidth: '84rem', margin: '0 auto', padding: '1.25rem 1.25rem 2rem' }}>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'start' }}>
          {/* Sidebar — desktop only */}
          <div className="hidden lg:block" style={{ width: '13rem', flexShrink: 0 }}>
            <AdminSidebarNav activeHref="/admin/orders" />
          </div>

          {/* Main content */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Button asChild variant="ghost" style={{ padding: '0.5rem' }}>
                <Link href="/admin/orders">← Orders</Link>
              </Button>
              {order && <h1 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Order #{order.orderNumber}</h1>}
              {order && (
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:text-white"
                  style={{ marginLeft: 'auto', fontSize: '0.75rem', gap: '0.35rem', padding: '0.5rem' }}
                  onClick={handleGenerateMemo}
                  disabled={memoLoading}
                >
                  {memoLoading ? 'Generating…' : '↓ Download Memo'}
                </Button>
              )}
            </div>

            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[1, 2].map((i) => <Skeleton key={i} style={{ height: '12rem' }} />)}
              </div>
            )}
            {notFound && !loading && <p style={{ color: 'var(--on-surface-muted)' }}>Order not found.</p>}
            {order && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <OrderSummaryCard order={order} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={sectionStyle}>
                    <p style={headingStyle}>Update Status</p>
                    {order.deliveryMode === 'pathao' ? (
                      <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-muted)' }}>
                        Order status is automatically managed by Pathao.
                      </p>
                    ) : (
                      <OrderStatusSelector
                        orderId={order.id}
                        currentStatus={order.status}
                        onStatusChange={(s, adminNotes) => setOrder((o) => o ? { ...o, status: s, ...(adminNotes !== null ? { adminNotes } : {}) } : o)}
                      />
                    )}
                  </div>
                  <ShippingDetailsEditor
                    order={order}
                    onOrderChange={(next) => setOrder(next)}
                  />
                  <DeliveryManagementCard
                    order={order}
                    onOrderChange={(next) => setOrder(next)}
                  />

                  {/* Customer Notes */}
                  <div style={sectionStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <p style={headingStyle}>Customer Notes</p>
                      {notesDraft === null ? (
                        <button
                          onClick={() => setNotesDraft(order.customerNotes ?? '')}
                          style={{ fontSize: '0.75rem', color: 'var(--brand-gold)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                        >
                          Edit
                        </button>
                      ) : (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => setNotesDraft(null)}
                            disabled={notesSaving}
                            style={{ fontSize: '0.75rem', color: 'var(--on-surface-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveNotes}
                            disabled={notesSaving}
                            style={{ fontSize: '0.75rem', color: 'var(--brand-gold)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                          >
                            {notesSaving ? 'Saving…' : 'Save'}
                          </button>
                        </div>
                      )}
                    </div>
                    {notesDraft === null ? (
                      <p style={{ fontSize: '0.85rem', color: order.customerNotes ? 'var(--on-surface)' : 'var(--on-surface-muted)', fontStyle: order.customerNotes ? 'normal' : 'italic', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                        {order.customerNotes || 'No notes'}
                      </p>
                    ) : (
                      <Textarea
                        value={notesDraft}
                        onChange={(e) => setNotesDraft(e.target.value)}
                        disabled={notesSaving}
                        placeholder="Customer notes…"
                        rows={3}
                        maxLength={180}
                        autoFocus
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ShopLayout>
  );
}
