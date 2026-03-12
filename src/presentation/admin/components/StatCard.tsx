interface StatCardProps {
  label:    string;
  value:    string | number;
  sub?:     string;
  accent?:  boolean;
}

export default function StatCard({ label, value, sub, accent }: StatCardProps) {
  return (
    <div
      style={{
        border:          '1px solid var(--border)',
        padding:         '1.25rem',
        backgroundColor: accent ? 'var(--brand-dark)' : 'var(--surface)',
        color:           accent ? 'var(--on-primary)' : 'inherit',
        display:         'flex',
        flexDirection:   'column',
        gap:             '0.35rem',
      }}
    >
      <p
        style={{
          fontSize:      '0.7rem',
          fontWeight:    600,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color:         accent ? 'rgba(255,255,255,0.65)' : 'var(--on-surface-muted)',
        }}
      >
        {label}
      </p>
      <p style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1 }}>{value}</p>
      {sub && (
        <p style={{ fontSize: '0.75rem', color: accent ? 'rgba(255,255,255,0.55)' : 'var(--on-surface-muted)' }}>
          {sub}
        </p>
      )}
    </div>
  );
}
