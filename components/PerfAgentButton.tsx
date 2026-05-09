'use client';

import { useState } from 'react';
import PerfAgentModal from './PerfAgentModal';

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
          border: '1px solid rgba(74, 222, 128, 0.4)',
          background: 'rgba(74, 222, 128, 0.06)',
          color: '#4ade80',
          fontFamily: 'monospace',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(74, 222, 128, 0.12)';
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(74, 222, 128, 0.7)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(74, 222, 128, 0.06)';
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(74, 222, 128, 0.4)';
        }}
      >
        <span style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: '#4ade80',
          boxShadow: '0 0 8px #4ade80',
          display: 'inline-block',
          animation: 'pulse 2s infinite',
        }} />
        ⚡ PerfAgent — Live AI Demo
      </button>

      {open && <PerfAgentModal onClose={() => setOpen(false)} />}
    </>
  );
}
