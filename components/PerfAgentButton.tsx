'use client';

import { useState } from 'react';
import PerfAgentModal from './PerfAgentModal';

// ─────────────────────────────────────────────────────────────
// PerfAgentButton — drop anywhere in your portfolio
// Inline styles (immune to Tailwind v4 purging).
// Requires in Vercel env vars: ANTHROPIC_API_KEY
// ─────────────────────────────────────────────────────────────

export default function PerfAgentButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 24px',
          borderRadius: '8px',
          border: '1px solid rgba(94, 234, 212, 0.4)',
          background: 'rgba(94, 234, 212, 0.06)',
          color: '#5eead4',
          fontFamily: 'monospace',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(94, 234, 212, 0.12)';
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(94, 234, 212, 0.7)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(94, 234, 212, 0.06)';
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(94, 234, 212, 0.4)';
        }}
      >
        <span style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: '#5eead4',
          boxShadow: '0 0 8px #5eead4',
          display: 'inline-block',
        }} />
        ⚡ OpsMind — Live AI Demo
      </button>

      {open && <PerfAgentModal onClose={() => setOpen(false)} />}
    </>
  );
}
