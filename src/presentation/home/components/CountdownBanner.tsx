'use client';

import { useEffect, useState } from 'react';

interface CountdownBannerProps {
  /** Pass an ISO-8601 date string from Server Components — Date objects are not serializable across the server/client boundary. */
  targetDate?: string | null;
}

type TimeParts = { days: number; hours: number; minutes: number; seconds: number };

function getTimeLeft(target: Date): TimeParts {
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    days:    Math.floor(diff / 86400000),
    hours:   Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

function Pad({ n }: { n: number }) {
  return (
    <span style={{ fontFamily: 'monospace', fontSize: '1.875rem', fontWeight: 700 }}>
      {String(n).padStart(2, '0')}
    </span>
  );
}

export default function CountdownBanner({ targetDate }: CountdownBannerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeParts | null>(null);

  useEffect(() => {
    if (!targetDate) return;
    const target = new Date(targetDate);
    if (target <= new Date()) return;
    setTimeLeft(getTimeLeft(target));
    const id = setInterval(() => setTimeLeft(getTimeLeft(target)), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (!targetDate || !timeLeft) return null;

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        padding: '1.5rem 0',
        color: 'white',
        backgroundColor: 'var(--brand-dark)',
      }}
    >
      {[
        { label: 'DAYS',    value: timeLeft.days },
        { label: 'HOURS',   value: timeLeft.hours },
        { label: 'MINUTES', value: timeLeft.minutes },
        { label: 'SECONDS', value: timeLeft.seconds },
      ].map(({ label, value }, i, arr) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.125rem' }}>
            <Pad n={value} />
            <span style={{ fontSize: '10px', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>{label}</span>
          </div>
          {i < arr.length - 1 && (
            <span style={{ fontSize: '1.5rem', fontWeight: 300, color: 'rgba(255,255,255,0.5)', marginTop: '-1rem' }}>:</span>
          )}
        </div>
      ))}
    </div>
  );
}
