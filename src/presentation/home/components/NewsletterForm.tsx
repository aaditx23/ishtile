'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // TODO: wire up to newsletter API
    toast.success('You\'re subscribed!');
    setEmail('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-0">
      <Input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 rounded-l-full rounded-r-none border-0 bg-neutral-800 text-white placeholder:text-neutral-500 focus-visible:ring-0 min-w-0 h-9"
      />
      <Button
        type="submit"
        size="sm"
        className="rounded-l-none rounded-r-full bg-[#A58C69] hover:bg-[#8f6f4a] text-white text-xs uppercase tracking-widest shrink-0 h-9"
        style={{ padding: '0.5rem' }}
      >
        Join
      </Button>
    </form>
  );
}
