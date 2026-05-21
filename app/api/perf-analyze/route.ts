import { NextRequest, NextResponse } from 'next/server';
import { retrieveRunbooks, formatRunbooksForPrompt } from '@/lib/runbooks';

// POST /api/perf-analyze
// Anthropic proxy with in-memory RAG retrieval over pre-seeded runbooks.

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY not configured on server' },
      { status: 500 }
    );
  }

  try {
    const { system, messages, ragQuery } = await req.json();

    // ── RAG: retrieve relevant runbooks ──
    let augmentedSystem = system;
    let retrievedTitles: string[] = [];

    if (ragQuery) {
      const retrieved = retrieveRunbooks(ragQuery, 3);
      if (retrieved.length > 0) {
        augmentedSystem = system + formatRunbooksForPrompt(retrieved);
        retrievedTitles = retrieved.map(r => r.runbook.title);
      }
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-5',
        max_tokens: 8192,
        system:     augmentedSystem,
        messages,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return NextResponse.json(err, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ ...data, _rag: { retrieved: retrievedTitles } });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
