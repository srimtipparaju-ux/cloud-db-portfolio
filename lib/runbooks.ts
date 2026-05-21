// ─────────────────────────────────────────────────────────────
// In-memory RAG for portfolio demo
//
// Zero dependencies. Pre-seeded with 6 realistic SRE runbooks
// covering Oracle, JVM, Kubernetes, and frontend issues.
//
// Uses TF-IDF + cosine similarity for retrieval — good enough
// to demo the "AI retrieves runbooks before answering" pattern
// without requiring Pinecone or external embeddings.
// ─────────────────────────────────────────────────────────────

export interface Runbook {
  id:       string;
  title:    string;
  category: 'runbook' | 'postmortem' | 'architecture';
  tags:     string[];
  content:  string;
}

// ── Pre-seeded runbooks ──────────────────────────────────────

export const RUNBOOKS: Runbook[] = [
  {
    id: 'rb-oracle-deadlock',
    title: 'Oracle Deadlock Resolution',
    category: 'runbook',
    tags: ['oracle', 'database', 'deadlock', 'enq:tx'],
    content: `Oracle deadlock resolution runbook.
When you see 'enq: TX - row lock contention' or ORA-00060, follow this sequence:

1. Identify the holding session from V$LOCK and V$SESSION_BLOCKERS
2. Check if the deadlock graph in the trace file (UDUMP) shows row-level contention
3. Common root causes:
   - Application code that updates rows in inconsistent order
   - Missing index on foreign key column causing TM contention
   - Bitmap indexes on OLTP tables
4. Immediate mitigation: ALTER SYSTEM KILL SESSION 'sid,serial#' on the blocker
5. Long-term fix: enforce consistent row update ordering in application code
6. Escalate to DBA team if deadlock persists after killing sessions.

Reference: ORA-00060 standard handling. Lock holder identified in trace.`,
  },
  {
    id: 'rb-jvm-deadlock',
    title: 'JVM Thread Deadlock Resolution',
    category: 'runbook',
    tags: ['java', 'jvm', 'deadlock', 'thread'],
    content: `JVM Thread Deadlock Resolution Runbook.
When jstack shows 'Found one Java-level deadlock' or threads in BLOCKED state on monitor entry:

1. Capture full thread dump: jstack -l <pid> > thread-dump.txt
2. Identify the two threads in the deadlock cycle
3. Trace the lock order — both threads hold one lock while waiting for the other
4. Common root causes:
   - Two services synchronizing in opposite order (OrderService then InventoryService vs reverse)
   - Nested synchronized blocks across class boundaries
   - Lock acquired inside a method that triggers another sync call
5. Mitigation: restart the affected JVM. Increase thread pool to absorb backpressure.
6. Long-term fix: enforce single lock ordering convention. Use tryLock with timeout.
7. Reference: Oracle's official lock ordering pattern.

Escalation: Backend team owns lock contention bugs. Page on-call if production deadlock.`,
  },
  {
    id: 'rb-jvm-oom',
    title: 'Java OutOfMemoryError Triage',
    category: 'runbook',
    tags: ['java', 'jvm', 'oom', 'memory leak', 'heap'],
    content: `Java OutOfMemoryError triage and resolution.
When you see 'java.lang.OutOfMemoryError: Java heap space':

1. Capture heap dump immediately (before JVM dies):
   jmap -dump:format=b,file=heap.hprof <pid>
2. Analyze in Eclipse MAT — focus on dominator tree, retained heap
3. Common root causes:
   - Unbounded HashMap/ArrayList growing forever (typical: caches without eviction)
   - Static collections holding references after lifecycle end
   - ThreadLocal not cleaned up in thread pool
   - ClassLoader leak after hot redeploys
4. Immediate mitigation:
   - Restart JVM with -Xmx increased temporarily
   - Add -XX:+HeapDumpOnOutOfMemoryError flag
5. Long-term fix:
   - Replace HashMap with Caffeine.newBuilder().maximumSize().expireAfterWrite()
   - Use WeakReference for caches when appropriate
   - Audit static fields for unbounded growth
6. Escalate to Backend team. Pool exhaustion follows OOM — connection pool will lock up.`,
  },
  {
    id: 'rb-connection-pool',
    title: 'Connection Pool Exhaustion',
    category: 'runbook',
    tags: ['hikari', 'connection pool', 'database', 'jdbc'],
    content: `HikariCP / connection pool exhaustion runbook.
Symptoms: SQLTimeoutException, 'Timeout failure waiting for connection', threads BLOCKED on getConnection().

1. Check pool metrics: HikariCP exposes active/idle/waiting via JMX
2. Common root causes:
   - Connections not returned to pool (missing try-with-resources)
   - Long-running queries holding connections (check slow_log)
   - Pool size too small for concurrent load
   - Database is the bottleneck (check DB sessions)
3. Immediate mitigation: increase maximumPoolSize temporarily, restart application
4. Long-term fix:
   - Audit code for unclosed JDBC connections
   - Set connectionTimeout=30s, validationTimeout=5s, leakDetectionThreshold=60000
   - Right-size pool: usually 10-20 per app instance
   - Watch for OOM upstream — connection pool exhaustion often follows JVM OOM
5. If preceded by OOM in app logs, fix the OOM first. Pool will recover.

Reference: https://github.com/brettwooldridge/HikariCP/wiki/About-Pool-Sizing`,
  },
  {
    id: 'rb-awr-wait',
    title: 'Oracle High db file sequential read',
    category: 'runbook',
    tags: ['oracle', 'awr', 'wait event', 'io', 'index'],
    content: `Oracle 'db file sequential read' wait event runbook.
When AWR shows >25% DB Time on db file sequential read:

1. This wait = single-block reads, typically index access
2. High percentage indicates I/O bottleneck on indexes or table data
3. Common root causes:
   - Missing or unusable index forcing repeated lookups
   - Buffer cache too small (advisory in AWR shows benefit of increase)
   - Slow underlying storage (check tablespace IO stats)
   - Hot SQL with high physical reads not in cache
4. Resolution priority:
   - Identify top SQL by elapsed time and physical reads
   - Check buffer hit ratio — below 95% is concerning
   - Run SQL Tuning Advisor on top SQL
   - Increase buffer cache if advisory shows >15% improvement
5. Long-term: create missing indexes, partition large tables, consider Exadata smart scans
6. Escalate to DBA team. Coordinate with infrastructure if storage IO is the bottleneck.`,
  },
  {
    id: 'rb-frontend-504',
    title: 'Frontend 504 Gateway Timeout cascade',
    category: 'runbook',
    tags: ['frontend', 'gateway', 'timeout', 'api', 'cascade'],
    content: `Frontend 504 Gateway Timeout cascade runbook.
When dashboard shows blank UI + console errors + 504s on API calls:

1. 504 is backend-originated — the gateway gave up waiting for upstream
2. Common causal chain:
   - Backend OOM or deadlock → connection pool exhausted
   - DB queries timing out → API requests pile up
   - Gateway times out at 30s → returns 504
   - Frontend tries .map() on undefined response → JS TypeError → blank UI
3. Check in order:
   - Backend app logs for OOM, deadlock, pool exhaustion
   - Database for slow queries, locks, full table scans
   - Network for connectivity issues
4. Resolution:
   - Fix the backend issue first (OOM, pool, slow SQL)
   - Frontend code should defensively handle undefined responses
   - Add loading states for slow API calls
   - Implement retry-with-backoff on client side
5. Reference: classic 'cascade failure' pattern. Root cause is rarely the 504 itself.

Escalation: depends on root cause — DBA if database, Backend if app, Frontend if undefined handling.`,
  },
];

// ── TF-IDF retrieval ─────────────────────────────────────────

function tokenize(text: string): string[] {
  return text.toLowerCase().match(/[a-z0-9]+/g) || [];
}

// Compute term frequency for one document
function tf(tokens: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const tok of tokens) counts.set(tok, (counts.get(tok) || 0) + 1);
  return counts;
}

// Precompute corpus stats (called once at module load)
const corpus = RUNBOOKS.map(r => ({
  runbook:    r,
  tokens:     tokenize(r.title + ' ' + r.tags.join(' ') + ' ' + r.content),
  termCounts: null as Map<string, number> | null,
}));
corpus.forEach(c => { c.termCounts = tf(c.tokens); });

// Document frequency — how many runbooks contain each term
const df = new Map<string, number>();
for (const c of corpus) {
  const seen = new Set<string>();
  for (const tok of c.tokens) {
    if (!seen.has(tok)) { seen.add(tok); df.set(tok, (df.get(tok) || 0) + 1); }
  }
}

function idf(term: string): number {
  const n = corpus.length;
  return Math.log((n + 1) / ((df.get(term) || 0) + 1)) + 1;
}

// Cosine similarity between query and document
function similarity(queryTokens: string[], docTokens: Map<string, number>): number {
  const queryTf = tf(queryTokens);

  let dot = 0, qNorm = 0, dNorm = 0;
  const allTerms = new Set([...queryTf.keys(), ...docTokens.keys()]);

  for (const term of allTerms) {
    const qWeight = (queryTf.get(term) || 0) * idf(term);
    const dWeight = (docTokens.get(term) || 0) * idf(term);
    dot   += qWeight * dWeight;
    qNorm += qWeight * qWeight;
    dNorm += dWeight * dWeight;
  }

  if (qNorm === 0 || dNorm === 0) return 0;
  return dot / (Math.sqrt(qNorm) * Math.sqrt(dNorm));
}

// ── Public API ───────────────────────────────────────────────

export interface RetrievedRunbook {
  runbook: Runbook;
  score:   number;
}

export function retrieveRunbooks(query: string, topK: number = 3): RetrievedRunbook[] {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  const scored = corpus.map(c => ({
    runbook: c.runbook,
    score:   similarity(queryTokens, c.termCounts!),
  }));

  scored.sort((a, b) => b.score - a.score);

  // Only return results above a minimum threshold
  return scored.filter(s => s.score > 0.05).slice(0, topK);
}

export function formatRunbooksForPrompt(retrieved: RetrievedRunbook[]): string {
  if (retrieved.length === 0) return '';

  return `\n\nRELEVANT INTERNAL RUNBOOKS (retrieved via semantic search):\n\n` +
    retrieved.map((r, i) =>
      `[Runbook ${i + 1}: "${r.runbook.title}" — relevance ${(r.score * 100).toFixed(0)}%]\n${r.runbook.content}\n`
    ).join('\n---\n');
}
