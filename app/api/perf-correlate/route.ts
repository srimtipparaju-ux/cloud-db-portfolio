import { NextRequest, NextResponse } from 'next/server';

// POST /api/perf-correlate
// Cross-artifact correlation agent.

const SYSTEM = `You are an expert performance incident analyst performing cross-artifact correlation.

IMPORTANT — KEEP OUTPUT CONCISE TO FIT IN TOKEN BUDGET:
- rootCause: maximum 25 words, one sentence
- incidentSummary: maximum 50 words
- Each timeline event: maximum 3 timeline events, evidence under 15 words
- Each causal step: cause/effect under 12 words each
- Each cross-artifact link: significance under 12 words
- Maximum 5 immediate actions, each under 12 words
You MUST close the JSON properly with all closing braces. If running long, truncate descriptions but always finish the JSON structure.

You receive findings from multiple diagnostic tools (AWR, thread dumps, heap dumps, JFR, app logs, SQL, JMeter, browser console, stack traces).

Find connections across artifacts, build a causal chain, create a chronological timeline, identify the root cause.

CRITICAL: Return ONLY a raw JSON object. No markdown fences. Start with { end with }:
{
  "rootCause": "single sentence root cause",
  "incidentSummary": "2-4 sentence causal narrative",
  "overallSeverity": "Critical|High|Medium|Low",
  "timelineEvents": [{"timestamp":"T+0s","layer":"Frontend|API|Application|Database|JVM|Infrastructure","artifact":"filename","event":"what happened","evidence":"specific metric or quote","linkedTo":["other-file"],"severity":"Critical|High|Medium|Low|Info"}],
  "causalChain": [{"step":1,"cause":"root event","effect":"what it caused","sourceArtifact":"filename","targetArtifact":"filename","linkType":"caused|amplified|triggered|exposed|masked"}],
  "crossArtifactLinks": [{"entityType":"SQL|RequestID|ErrorClass|ClassName|Metric","entityValue":"shared value","appearsIn":["file1","file2"],"significance":"why this matters"}],
  "immediateActions": ["action 1","action 2"]
}`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY not configured' },
      { status: 500 }
    );
  }

  try {
    const { analyses } = await req.json();
    if (!Array.isArray(analyses) || analyses.length < 2) {
      return NextResponse.json({ error: 'Provide at least 2 analyses' }, { status: 400 });
    }

    const summaries = analyses.map((a: any) => ({
      fileName:       a.fileName,
      skill:          a.skill,
      health:         a.result?.overallHealth,
      summary:        a.result?.summary,
      keyMetrics:     a.result?.keyMetrics,
      findings:       (a.result?.findings || []).slice(0, 8).map((f: any) => ({
        severity: f.severity, category: f.category,
        title: f.title, evidence: f.evidence, rootCause: f.rootCause,
      })),
      contentPreview: (a.content || '').slice(0, 2000),
    }));

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
        system:     SYSTEM,
        messages: [{
          role:    'user',
          content: `Correlate these ${analyses.length} diagnostic artifacts:\n\n${JSON.stringify(summaries, null, 2)}`,
        }],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return NextResponse.json(err, { status: response.status });
    }

    return NextResponse.json(await response.json());
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
