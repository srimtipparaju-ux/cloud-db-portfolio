'use client';

import { useState } from 'react';
import PerfAgentModal from './PerfAgentModal';

// ─────────────────────────────────────────────────────────────
// PerfAgentButton — drop anywhere in your portfolio
//
// Usage in page.tsx:
//   import PerfAgentButton from '@/components/PerfAgentButton';
//   <PerfAgentButton />
//
// Requires in Vercel env vars: ANTHROPIC_API_KEY
// ─────────────────────────────────────────────────────────────

export default function PerfAgentButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-3 px-6 py-3 rounded-lg
          border border-green-400/30 bg-green-400/5
          hover:bg-green-400/10 hover:border-green-400/60
          text-green-400 font-mono text-sm font-semibold
          transition-all duration-200"
      >
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        ⚡ PerfAgent — Live AI Demo
      </button>

      {open && <PerfAgentModal onClose={() => setOpen(false)} />}
    </>
  );
}
