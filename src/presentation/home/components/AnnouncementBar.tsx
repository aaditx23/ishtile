'use client';

interface AnnouncementBarProps {
  text?: string;
}

export default function AnnouncementBar({ text }: AnnouncementBarProps) {
  if (!text) return null;

  return (
    <div
      style={{
        width: '100%',
        textAlign: 'center',
        fontSize: '0.875rem',
        padding: '0.5rem 0',
        color: 'white',
        backgroundColor: 'var(--color-brand-dark)',
      }}
    >
      {text}
    </div>
  );
}
