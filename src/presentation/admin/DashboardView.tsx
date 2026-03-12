'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import ShopLayout from '@/presentation/shared/layouts/ShopLayout';
import { AdminSidebarNav } from './AdminLayout';
import AdminMobileNavStrip from './components/AdminMobileNavStrip';
import StatCard from './components/StatCard';
import { getDashboardStats } from '@/application/analytics/getDashboardStats';
import type { DashboardStatsDto } from '@/shared/types/api.types';

const fmt = (n: number) => `৳${n.toLocaleString('en-BD')}`;

export default function DashboardView() {
  const [stats, setStats]     = useState<DashboardStatsDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(() => toast.error('Failed to load dashboard stats.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ShopLayout>
      {/* ── Mobile nav ─────────────────────────────────────────────────── */}
      <div className="lg:hidden" style={{ padding: '1.25rem 1rem 0' }}>
        <AdminMobileNavStrip activeHref="/admin" />
      </div>

      <div style={{ maxWidth: '84rem', margin: '0 auto', padding: '1.25rem 1.25rem 2rem' }}>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'start' }}>
          {/* Sidebar — desktop only */}
          <div className="hidden lg:block" style={{ width: '13rem', flexShrink: 0 }}>
            <AdminSidebarNav activeHref="/admin" />
          </div>

          {/* Main content */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Dashboard</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
              {loading || !stats ? (
                [1,2,3,4,5,6].map((i) => <Skeleton key={i} style={{ height: '5rem' }} />)
              ) : (
                <>
                  <StatCard label="Today's Orders"  value={stats.todayOrders}       accent />
                  <StatCard label="Today's Revenue" value={fmt(stats.todayRevenue)} />
                  <StatCard label="Pending Orders"  value={stats.pendingOrders}     sub="awaiting action" />
                  <StatCard label="Low Stock"       value={stats.lowStockVariants}  sub="variants" />
                  <StatCard label="Total Customers" value={stats.totalCustomers}    />
                  <StatCard label="Active Promos"   value={stats.activePromos}      />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </ShopLayout>
  );
}
