'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { tokenStore } from '@/infrastructure/auth/tokenStore';
import DeliveryStatusBadge from './DeliveryStatusBadge';
import type { Shipment } from '@/domain/order/order.entity';

const fmt = (n: number) => `৳${Number(n || 0).toFixed(0)}`;

interface CourierDeliveryCardProps {
  shipment:      Shipment;
  onStatusSync?: (updated: Partial<Shipment>) => void;
}

export default function CourierDeliveryCard({ shipment, onStatusSync }: CourierDeliveryCardProps) {
  const [syncing, setSyncing] = useState(false);

  const handleSync = useCallback(async () => {
    if (!shipment.consignmentId) return;
    setSyncing(true);
    try {
      const token = tokenStore.getAccess();
      const res = await fetch(
        `/api/pathao/order-status?consignmentId=${encodeURIComponent(shipment.consignmentId)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message ?? 'Sync failed');
      toast.success(`Status synced: ${json.data.pathaoStatus ?? json.data.internalStatus}`);
      onStatusSync?.({
        status:      json.data.internalStatus ?? shipment.status,
        pathaoStatus: json.data.pathaoStatus ?? null,
        statusUpdateTime: Date.now(),
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Status sync failed');
    } finally {
      setSyncing(false);
    }
  }, [shipment.consignmentId, shipment.status, onStatusSync]);

  const rowStyle: React.CSSProperties = {
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'center',
    padding:        '0.4rem 0',
    borderBottom:   '1px solid var(--border)',
    fontSize:       '0.82rem',
  };

  const labelStyle: React.CSSProperties = {
    color:      'var(--on-surface-muted)',
    fontWeight: 500,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Status row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <DeliveryStatusBadge status={shipment.status} />
        {shipment.pathaoStatus && (
          <span style={{ fontSize: '0.72rem', color: 'var(--on-surface-muted)' }}>
            Pathao: {shipment.pathaoStatus}
          </span>
        )}
      </div>

      {/* Details */}
      <div style={{ borderTop: '1px solid var(--border)' }}>
        {shipment.consignmentId && (
          <div style={rowStyle}>
            <span style={labelStyle}>Consignment ID</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.78rem' }}>
              {shipment.consignmentId}
            </span>
          </div>
        )}
        {!!shipment.deliveryFee && (
          <div style={rowStyle}>
            <span style={labelStyle}>Delivery Charge</span>
            <span style={{ fontWeight: 600 }}>{fmt(shipment.deliveryFee)}</span>
          </div>
        )}
        {!!shipment.itemWeight && (
          <div style={rowStyle}>
            <span style={labelStyle}>Weight</span>
            <span>{shipment.itemWeight} kg</span>
          </div>
        )}
        {shipment.statusUpdateTime && (
          <div style={{ ...rowStyle, borderBottom: 'none' }}>
            <span style={labelStyle}>Last Updated</span>
            <span style={{ fontSize: '0.75rem' }}>
              {new Date(shipment.statusUpdateTime).toLocaleString('en-GB', {
                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
              })}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {shipment.consignmentId && (
          <a
            href={`https://pathao.com/bn/parcel-tracker/?consignment_id=${encodeURIComponent(shipment.consignmentId)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding:         '0.4rem 0.9rem',
              borderRadius:    '0.5rem',
              border:          '1px solid var(--border)',
              fontSize:        '0.78rem',
              fontWeight:      600,
              textDecoration:  'none',
              color:           'var(--on-surface)',
            }}
          >
            Track Parcel ↗
          </a>
        )}
        <button
          onClick={handleSync}
          disabled={syncing || !shipment.consignmentId}
          style={{
            padding:         '0.4rem 0.9rem',
            borderRadius:    '0.5rem',
            border:          '1px solid var(--border)',
            fontSize:        '0.78rem',
            fontWeight:      600,
            cursor:          syncing ? 'not-allowed' : 'pointer',
            backgroundColor: 'transparent',
            color:           'var(--on-surface)',
            opacity:         syncing ? 0.6 : 1,
          }}
        >
          {syncing ? 'Syncing…' : '⟳ Sync Status'}
        </button>
      </div>
    </div>
  );
}
