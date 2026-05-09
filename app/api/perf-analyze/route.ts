import { NextRequest, NextResponse } from 'next/server';

// POST /api/perf-analyze
// Proxies to Anthropic using server-side ANTHROPIC_API_KEY.
// API key is never sent to the browser.

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY not configured on server' },
      { status: 500 }
    );
  }

  try {
    const { system, messages } = await req.json();

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
        system,
        messages,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return NextResponse.json(err, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
