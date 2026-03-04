import AdminLayout from './AdminLayout';
import StatCard from './components/StatCard';
import type { DashboardStatsDto } from '@/shared/types/api.types';

interface DashboardViewProps {
  stats: DashboardStatsDto;
}

const fmt = (n: number) => `৳${n.toLocaleString('en-BD')}`;

export default function DashboardView({ stats }: DashboardViewProps) {
  return (
    <AdminLayout activeHref="/admin">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Dashboard</h1>

        <div
          style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap:                 '1rem',
          }}
        >
          <StatCard label="Today's Orders"   value={stats.todayOrders}          accent />
          <StatCard label="Today's Revenue"  value={fmt(stats.todayRevenue)}    />
          <StatCard label="Pending Orders"   value={stats.pendingOrders}        sub="awaiting action" />
          <StatCard label="Low Stock"        value={stats.lowStockVariants}     sub="variants" />
          <StatCard label="Total Customers"  value={stats.totalCustomers}       />
          <StatCard label="Active Promos"    value={stats.activePromos}         />
        </div>
      </div>
    </AdminLayout>
  );
}
