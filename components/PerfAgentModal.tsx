'use client';

import { useState, useRef, useCallback } from 'react';

// ─────────────────────────────────────────────────────────────
// PerfAgentModal — full AI performance diagnostic demo
// Self-contained. No new npm dependencies.
// API routes: /api/perf-analyze  /api/perf-correlate
// ─────────────────────────────────────────────────────────────

// ── Types ────────────────────────────────────────────────────
interface Finding {
  id: string;
  severity: string;
  category: string;
  title: string;
  evidence: string;
  rootCause: string;
  impact: string;
  recommendations: string[];
  componentOwner?: string;
}

interface AnalysisResult {
  overallHealth: string;
  summary: string;
  keyMetrics: Record<string, string>;
  findings: Finding[];
}

interface FileItem {
  name: string;
  content: string;
  skill: SkillName;
  size: number;
  isBuiltIn: boolean;
}

interface TimelineEvent {
  timestamp: string;
  layer: string;
  artifact: string;
  event: string;
  evidence: string;
  linkedTo: string[];
  severity: string;
}

interface CausalStep {
  step: number;
  cause: string;
  effect: string;
  sourceArtifact: string;
  targetArtifact: string;
  linkType: string;
}

interface CrossArtifactLink {
  entityType: string;
  entityValue: string;
  appearsIn: string[];
  significance: string;
}

interface Timeline {
  rootCause: string;
  incidentSummary: string;
  overallSeverity: string;
  timelineEvents: TimelineEvent[];
  causalChain: CausalStep[];
  crossArtifactLinks: CrossArtifactLink[];
  immediateActions: string[];
}

type SkillName =
  | 'awr-analysis' | 'sql-monitor-analysis' | 'sql-tuning'
  | 'thread-dump-analysis' | 'heap-dump-analysis' | 'jfr-analysis'
  | 'ui-console-analysis' | 'stack-trace-analysis' | 'jmeter-analysis'
  | 'k8s-analysis';

type TabName = 'findings' | 'routing' | 'pipeline' | 'timeline' | 'chat' | 'runs';

// ── Run history (data engineering layer, browser-persisted) ──
type RunRecord = {
  id: string;
  startedAt: string;
  durationMs: number;
  fileCount: number;
  overallSeverity: string;
  rootCause: string;
  findingsTotal: number;
  findingsBySeverity: Record<string, number>;
  findingsBySkill: Record<string, number>;
};

const RUNS_KEY = 'opsmind_runs_v1';

function loadRunHistory(): RunRecord[] {
  try { return JSON.parse(localStorage.getItem(RUNS_KEY) || '[]'); } catch { return []; }
}
function saveRunHistory(record: RunRecord) {
  try {
    const runs = loadRunHistory();
    runs.unshift(record);
    localStorage.setItem(RUNS_KEY, JSON.stringify(runs.slice(0, 100)));
  } catch { /* storage unavailable — non-fatal */ }
}

// ── Skill metadata ───────────────────────────────────────────
const SKILL: Record<SkillName, { icon: string; label: string; color: string; team: string }> = {
  'awr-analysis':         { icon: '🗄️',  label: 'AWR',        color: '#4a9eff', team: 'DBA Team'         },
  'sql-monitor-analysis': { icon: '📊',  label: 'SQL Monitor', color: '#4a9eff', team: 'DBA Team'         },
  'sql-tuning':           { icon: '⚡',  label: 'SQL Tuning',  color: '#4a9eff', team: 'DBA Team'         },
  'thread-dump-analysis': { icon: '🧵',  label: 'Thread Dump', color: '#ff7040', team: 'Backend Team'     },
  'heap-dump-analysis':   { icon: '💾',  label: 'Heap Dump',   color: '#ff7040', team: 'Backend Team'     },
  'jfr-analysis':         { icon: '✈️',  label: 'JFR',         color: '#ff7040', team: 'Backend Team'     },
  'ui-console-analysis':  { icon: '🌐',  label: 'UI Console',  color: '#ffb340', team: 'Frontend Team'    },
  'stack-trace-analysis': { icon: '💥',  label: 'Stack Trace', color: '#ff4560', team: 'On-Call'          },
  'jmeter-analysis':      { icon: '📈',  label: 'JMeter',      color: '#b06aff', team: 'Performance Team' },
  'k8s-analysis':         { icon: '☸️',  label: 'Kubernetes',  color: '#326ce5', team: 'Platform Team'    },
};

// ── Prompts (NO triple backticks inside strings — they break JS template literals) ──
const PROMPTS: Record<SkillName, string> = {
  'awr-analysis':
    'You are an expert Oracle DBA analyzing an AWR report. Analyze: top wait events, top SQL by elapsed/CPU, instance efficiency ratios (Buffer Hit%, Library Hit%, Execute-to-Parse%), memory sizing, I/O latency, hard parse rate. ' +
    'CRITICAL: Return ONLY a raw JSON object. No markdown fences. Start with { end with }. CONSTRAINTS: Generate 3-6 findings max. Each finding has 2-3 recommendations max, each under 25 words. Keep evidence under 30 words. Close all JSON braces properly. ' +
    '{"overallHealth":"Critical|Degraded|Fair|Good","summary":"2-3 sentence summary","keyMetrics":{"metric":"value"},"findings":[{"id":"F001","severity":"Critical|High|Medium|Low|Info","category":"Wait Events|SQL|Memory|I/O|Parsing","title":"...","evidence":"specific numbers from input","rootCause":"...","impact":"...","recommendations":["..."]}]}',

  'sql-monitor-analysis':
    'You are an expert Oracle performance engineer analyzing a SQL Monitoring Report. For every plan step: compute A-Time %, compare E-Rows vs A-Rows, identify access path, evaluate join method, check predicates. ' +
    'CRITICAL: Return ONLY a raw JSON object. No markdown fences. Start with { end with }. CONSTRAINTS: Generate 3-6 findings max. Each finding has 2-3 recommendations max, each under 25 words. Keep evidence under 30 words. Close all JSON braces properly. ' +
    '{"overallHealth":"Critical|Degraded|Fair|Good","summary":"...","keyMetrics":{},"findings":[{"id":"F001","severity":"Critical|High|Medium|Low|Info","category":"Access Path|Join|Row Estimation|Predicate|Sort","title":"...","evidence":"...","rootCause":"...","impact":"...","recommendations":["..."],"affectedObject":"table/index"}]}',

  'sql-tuning':
    'You are an expert SQL performance engineer. Check: Cartesian joins, SELECT *, non-SARGable predicates (functions on columns, implicit type conversion), correlated subqueries, NOT IN with nullable column, DISTINCT hiding join problem, HAVING vs WHERE, DML without WHERE. Provide corrected SQL for each issue. ' +
    'CRITICAL: Return ONLY a raw JSON object. No markdown fences. Start with { end with }. CONSTRAINTS: Generate 3-6 findings max. Each finding has 2-3 recommendations max, each under 25 words. Keep evidence under 30 words. Close all JSON braces properly. ' +
    '{"overallHealth":"Critical|Degraded|Fair|Good","summary":"...","keyMetrics":{"issues_found":"N"},"findings":[{"id":"F001","severity":"Critical|High|Medium|Low|Info","category":"Join|WHERE|SELECT|Subquery|Aggregation|DML","title":"...","evidence":"exact problematic SQL","rootCause":"...","impact":"...","recommendations":["description","corrected SQL: SELECT ..."]}]}',

  'thread-dump-analysis':
    'You are an expert Java performance engineer analyzing a thread dump. Find: deadlocks (trace full lock chain), BLOCKED thread count and lock holder, thread pool exhaustion, RUNNABLE threads in I/O vs CPU. ' +
    'CRITICAL: Return ONLY a raw JSON object. No markdown fences. Start with { end with }. CONSTRAINTS: Generate 3-6 findings max. Each finding has 2-3 recommendations max, each under 25 words. Keep evidence under 30 words. Close all JSON braces properly. ' +
    '{"overallHealth":"Critical|Degraded|Fair|Good","summary":"...","keyMetrics":{"total_threads":"N","blocked":"N","deadlocks":"N"},"findings":[{"id":"F001","severity":"Critical|High|Medium|Low|Info","category":"Deadlock|Lock Contention|Thread Pool|CPU|I/O","title":"...","evidence":"thread names, lock addresses, stack frames","rootCause":"...","impact":"...","recommendations":["..."]}]}',

  'heap-dump-analysis':
    'You are an expert Java engineer analyzing a heap dump. Find: top retained heap consumers, leak suspects (unbounded collections, static maps, ThreadLocals), GC root paths explaining why objects cannot be collected, OOM classification. ' +
    'CRITICAL: Return ONLY a raw JSON object. No markdown fences. Start with { end with }. CONSTRAINTS: Generate 3-6 findings max. Each finding has 2-3 recommendations max, each under 25 words. Keep evidence under 30 words. Close all JSON braces properly. ' +
    '{"overallHealth":"Critical|Degraded|Fair|Good","summary":"...","keyMetrics":{"heap_used":"...","top_object":"..."},"findings":[{"id":"F001","severity":"Critical|High|Medium|Low|Info","category":"Memory Leak|GC Pressure|OOM|Static Reference|Cache","title":"...","evidence":"retained sizes, class names, GC root chain","rootCause":"...","impact":"...","recommendations":["..."]}]}',

  'jfr-analysis':
    'You are an expert Java performance engineer analyzing JFR data. Find: CPU hotspots by self%, GC overhead % and allocation rate, lock contention by total blocked time, I/O latency, JIT deoptimizations. ' +
    'CRITICAL: Return ONLY a raw JSON object. No markdown fences. Start with { end with }. CONSTRAINTS: Generate 3-6 findings max. Each finding has 2-3 recommendations max, each under 25 words. Keep evidence under 30 words. Close all JSON braces properly. ' +
    '{"overallHealth":"Critical|Degraded|Fair|Good","summary":"...","keyMetrics":{"gc_overhead":"...","top_method":"...","allocation_rate":"..."},"findings":[{"id":"F001","severity":"Critical|High|Medium|Low|Info","category":"CPU|GC|Lock|I/O|Allocation|JIT","title":"...","evidence":"method names, percentages, durations","rootCause":"...","impact":"...","recommendations":["..."]}]}',

  'ui-console-analysis':
    'You are an expert frontend engineer analyzing browser console/network logs. Find: JS errors traced to root cause, slow requests (TTFB, N+1 patterns, duplicates), Core Web Vitals failures (LCP > 2.5s, CLS > 0.1, INP > 200ms), CORS/CSP issues. ' +
    'CRITICAL: Return ONLY a raw JSON object. No markdown fences. Start with { end with }. CONSTRAINTS: Generate 3-6 findings max. Each finding has 2-3 recommendations max, each under 25 words. Keep evidence under 30 words. Close all JSON braces properly. ' +
    '{"overallHealth":"Critical|Degraded|Fair|Good","summary":"...","keyMetrics":{"errors":"N","slowest_call":"...","lcp":"..."},"findings":[{"id":"F001","severity":"Critical|High|Medium|Low|Info","category":"JS Error|Network|Core Web Vitals|Security|React","title":"...","evidence":"console lines, URLs, timings","rootCause":"...","impact":"...","recommendations":["..."]}]}',

  'stack-trace-analysis':
    'You are an expert engineer analyzing stack traces in any language. ALWAYS find the innermost Caused By — that is the real root cause, not the wrapper. Find the application code frame closest to the root. ' +
    'CRITICAL: Return ONLY a raw JSON object. No markdown fences. Start with { end with }. CONSTRAINTS: Generate 3-6 findings max. Each finding has 2-3 recommendations max, each under 25 words. Keep evidence under 30 words. Close all JSON braces properly. ' +
    '{"overallHealth":"Critical|Degraded|Fair|Good","summary":"...","keyMetrics":{"language":"...","exception":"...","location":"Class.method():line"},"findings":[{"id":"F001","severity":"Critical|High|Medium|Low|Info","category":"NullPointer|OOM|Deadlock|Config|Network|Database","title":"...","evidence":"exception message and key frames","rootCause":"...","impact":"...","recommendations":["..."]}]}',

  'jmeter-analysis':
    'You are an expert performance engineer analyzing JMeter load test results. For single release: evaluate p90/p99/errors per transaction. For release comparison: compute per-transaction deltas (p90 +50% = Critical). Map regressions to component owners. ' +
    'CRITICAL: Return ONLY a raw JSON object. No markdown fences. Start with { end with }. CONSTRAINTS: Generate 3-6 findings max. Each finding has 2-3 recommendations max, each under 25 words. Keep evidence under 30 words. Close all JSON braces properly. ' +
    '{"overallHealth":"Critical|Degraded|Fair|Good","summary":"...","keyMetrics":{"total_samples":"N","overall_error_rate":"X%","p90":"Xms"},"findings":[{"id":"F001","severity":"Critical|High|Medium|Low|Info","category":"Response Time|Error Rate|Regression","title":"...","evidence":"specific numbers with deltas","rootCause":"...","impact":"...","recommendations":["..."],"componentOwner":"team name"}]}',

  'k8s-analysis':
    'You are an expert Kubernetes SRE analyzing K8s diagnostic output. Identify: pod state issues (OOMKilled, CrashLoopBackOff, ImagePullBackOff, Pending), container resource issues (requests vs limits, CPU throttling, OOM patterns), health probe failures, scheduling issues, autoscaling problems (HPA not scaling), networking/storage failures. ' +
    'CRITICAL: Return ONLY a raw JSON object. No markdown fences. Start with { end with }. CONSTRAINTS: Generate 3-6 findings max. Each finding has 2-3 recommendations max, each under 25 words. Keep evidence under 30 words. Close all JSON braces properly. ' +
    '{"overallHealth":"Critical|Degraded|Fair|Good","summary":"...","keyMetrics":{"pods_total":"N","pods_failing":"N","oom_count":"N"},"findings":[{"id":"F001","severity":"Critical|High|Medium|Low|Info","category":"Pod State|Resource Limits|Health Probe|Scheduling|Autoscaling|Networking|Storage","title":"...","evidence":"pod names, exit codes, resource numbers","rootCause":"...","impact":"...","recommendations":["..."]}]}',
};

// ── Built-in sample files ────────────────────────────────────
const SAMPLES: FileItem[] = [
  {
    name: 'awr_report.txt', skill: 'awr-analysis', size: 4800, isBuiltIn: true,
    content: `WORKLOAD REPOSITORY report — DB Name: PRODDB  Instance: proddb1  Oracle 19.0.0.0.0
Snap Id: 84201 to 84209  Elapsed: 120 min  DB Time: 1824 min

Hard parses per second: 182.4   HIGH — bind variables missing
Buffer Hit %: 91.4   BELOW 95% threshold
Library Hit %: 94.2   BELOW 95% threshold
Execute to Parse %: 67.1   BELOW 80% threshold

Top Wait Events:
db file sequential read    847,293 waits  3841s  4.53ms avg  35.0% DB time  CRITICAL
log file sync               48,203 waits   720s 14.94ms avg   6.6% DB time  HIGH
library cache lock          12,840 waits   580s 45.18ms avg   5.3% DB time

Top SQL by Elapsed Time:
4820s - SELECT * FROM orders o, customers c WHERE TRUNC(o.order_date) > :d  48M buffers 12M reads
1284s - SELECT customer_id, COUNT(*) FROM orders WHERE status='OPEN' GROUP BY customer_id

Memory: Buffer Cache 16384M - Advisory shows +4GB gives 18% fewer reads - UNDERSIZED
PGA targets honoured: 82.4% - BELOW 90% - Multi-pass sorts: 1.8% - CRITICAL disk spill
USERS tablespace avg read: 28.4ms - ABOVE 20ms threshold - storage bottleneck`,
  },
  {
    name: 'slow_query.sql', skill: 'sql-tuning', size: 1200, isBuiltIn: true,
    content: `-- Order dashboard query - reported 45+ seconds
SELECT DISTINCT
    o.order_id, o.order_date, o.status, o.amount,
    c.customer_name, c.email,
    r.region_name, r.region_code,
    p.product_name, p.category,
    (SELECT COUNT(*) FROM order_items i WHERE i.order_id = o.order_id) AS item_count,
    (SELECT SUM(i.unit_price * i.quantity) FROM order_items i WHERE i.order_id = o.order_id) AS total,
    (SELECT MAX(e.event_date) FROM order_events e WHERE e.order_id = o.order_id) AS last_event
FROM orders o, customers c, regions r
JOIN products p ON p.product_id = o.product_id
WHERE c.customer_id = o.customer_id
  AND UPPER(c.status) = 'ACTIVE'
  AND TRUNC(o.order_date) BETWEEN '2024-01-01' AND '2024-03-31'
  AND o.status NOT IN ('CANCELLED', 'REFUNDED')
ORDER BY o.order_date DESC;`,
  },
  {
    name: 'thread_dump.txt', skill: 'thread-dump-analysis', size: 2800, isBuiltIn: true,
    content: `Full thread dump Java HotSpot 64-Bit Server VM

Found one Java-level deadlock:
"http-nio-8080-exec-3": waiting to lock <0xf1a2b340> (com.example.OrderService) held by "http-nio-8080-exec-7"
"http-nio-8080-exec-7": waiting to lock <0xf1a2b3a0> (com.example.InventoryService) held by "http-nio-8080-exec-3"

"http-nio-8080-exec-3" BLOCKED
  at com.example.service.OrderService.reserveInventory(OrderService.java:142)
  - waiting to lock <0xf1a2b340> (OrderService)
  - locked <0xf1a2b3a0> (InventoryService)

"http-nio-8080-exec-7" BLOCKED
  at com.example.service.InventoryService.checkAvailability(InventoryService.java:112)
  - waiting to lock <0xf1a2b3a0> (InventoryService)
  - locked <0xf1a2b340> (OrderService)

"http-nio-8080-exec-1" BLOCKED - waiting to lock <0xf1a2b340>
"http-nio-8080-exec-2" BLOCKED - waiting to lock <0xf1a2b340>
"http-nio-8080-exec-4" BLOCKED - waiting to lock <0xf1a2b340>

Thread summary: Total: 218 | RUNNABLE: 194 | BLOCKED: 18 | WAITING: 4`,
  },
  {
    name: 'heap_dump_report.txt', skill: 'heap-dump-analysis', size: 3200, isBuiltIn: true,
    content: `Eclipse Memory Analyzer - Leak Suspects Report
Heap: 8192MB configured | 7841MB used (95.7%) | Trigger: OutOfMemoryError

DOMINATOR TREE:
1. com.example.cache.LocalOrderCache  Retained: 5284MB (67.4%)
   java.util.HashMap [4,820,293 entries] - unbounded, no eviction policy
   com.example.model.OrderSummary x4.8M (avg 1.1KB each)

2. com.example.service.SessionManager  Retained: 842MB (10.7%)
   ConcurrentHashMap [284,293 sessions] - no TTL configured

LEAK SUSPECT CRITICAL:
LocalOrderCache.data is an unbounded HashMap.
CacheWarmupService.warmup() loaded 4,820,293 OrderSummary at startup.
GC Root: static field LocalOrderCache.INSTANCE -> HashMap -> 4.8M OrderSummary

Fix: Caffeine.newBuilder().maximumSize(50000).expireAfterWrite(30, TimeUnit.MINUTES).build()

OOM STACK:
java.lang.OutOfMemoryError: Java heap space
  at com.example.cache.LocalOrderCache.put(LocalOrderCache.java:67)
  at com.example.service.CacheWarmupService.warmup(CacheWarmupService.java:134)`,
  },
  {
    name: 'browser_console.log', skill: 'ui-console-analysis', size: 2800, isBuiltIn: true,
    content: `[14:30:00] GET https://api.example.com/dashboard/orders  504 Gateway Timeout  32451ms CRITICAL
[14:30:00] Uncaught TypeError: Cannot read properties of undefined (reading 'data')
           at OrderList.render (OrderList.jsx:45) - orders API returned 504
[14:30:07] GET https://api.example.com/products/101  200  312ms
[14:30:07] GET https://api.example.com/products/102  200  298ms
[14:30:07] GET https://api.example.com/products/103  200  341ms
[14:30:08] GET https://api.example.com/products/104  200  287ms
[14:30:08] GET https://api.example.com/products/105  200  318ms  N+1: 13 sequential calls
[14:30:09] CORS blocked: analytics.thirdparty.com
[14:30:11] [React Warning] Each child needs unique key prop - OrderTable.jsx:67
[14:30:12] [Violation] click handler took 824ms - blocking main thread

Core Web Vitals:
LCP: 8420ms  FAIL (threshold 2500ms)
CLS: 0.38    FAIL (threshold 0.10)
INP: 842ms   FAIL (threshold 200ms)
TTFB: 1420ms FAIL (threshold 800ms)`,
  },
  {
    name: 'error_log.log', skill: 'stack-trace-analysis', size: 2400, isBuiltIn: true,
    content: `2024-03-15 14:23:47 ERROR [http-exec-5] OrderController - Failed to process order 98765
java.lang.RuntimeException: Order processing pipeline failure
    at com.example.service.OrderService.processOrder(OrderService.java:89)
    at com.example.controller.OrderController.submitOrder(OrderController.java:45)
Caused by: org.springframework.dao.DataAccessResourceFailureException: Unable to acquire JDBC Connection
    at com.zaxxer.hikari.pool.HikariPool.getConnection(HikariPool.java:213)
    at com.zaxxer.hikari.HikariDataSource.getConnection(HikariDataSource.java:128)
Caused by: java.sql.SQLTimeoutException: Timeout 30000ms (pool: active=20/20 idle=0 waiting=48)
    at com.zaxxer.hikari.pool.HikariPool.getConnectionTimeout(HikariPool.java:225)
Caused by: java.lang.OutOfMemoryError: Java heap space
    at java.util.Arrays.copyOf(Arrays.java:3210)
    at com.example.cache.LocalOrderCache.put(LocalOrderCache.java:67)
    at com.example.service.CacheWarmupService.warmup(CacheWarmupService.java:134)

2024-03-15 14:24:02 WARN [pool-monitor] - Pool EXHAUSTED: active=20/20 idle=0 waiting=84`,
  },
  {
    name: 'jmeter_comparison.csv', skill: 'jmeter-analysis', size: 1400, isBuiltIn: true,
    content: `JMeter Release Comparison - Release 1.3 vs Release 1.4
50 threads, 300s, same staging environment

RELEASE 1.3 BASELINE:
Label,Samples,Average,90% Line,Error %,Throughput
GET /api/orders,5000,284,480,0.24%,48.2
POST /api/orders,5000,820,1240,0.42%,12.4
GET /api/checkout/summary,5000,342,524,0.16%,48.8

RELEASE 1.4 NEW:
Label,Samples,Average,90% Line,Error %,Throughput
GET /api/orders,5000,298,508,0.26%,46.8
POST /api/orders,5000,1840,2820,2.84%,8.2
GET /api/checkout/summary,5000,1124,1720,1.42%,28.4

Component owners: Orders=Backend/Order Team, Checkout=Backend/Commerce Team`,
  },
  {
    name: 'k8s_pod_diagnostic.txt', skill: 'k8s-analysis', size: 4200, isBuiltIn: true,
    content: `=== Kubernetes Diagnostic Output ===
Namespace: production
Cluster: prod-us-east-1

$ kubectl get pods -n production -l app=order-service
NAME                              READY   STATUS             RESTARTS      AGE
order-service-7d9c8b6f5-2xkpq    0/1     CrashLoopBackOff   12 (2m ago)   48m
order-service-7d9c8b6f5-7lqv4    0/1     CrashLoopBackOff   11 (3m ago)   48m
order-service-7d9c8b6f5-9hgxn    0/1     OOMKilled          8 (47s ago)   48m
order-service-7d9c8b6f5-bzc8d    1/1     Running            3 (12m ago)   48m
order-service-7d9c8b6f5-mfp2j    0/1     CrashLoopBackOff   14 (1m ago)   48m

$ kubectl describe pod order-service-7d9c8b6f5-9hgxn -n production

Containers:
  order-service:
    Image:          registry.example.com/order-service:v2.8.4
    State:          Waiting
      Reason:       CrashLoopBackOff
    Last State:     Terminated
      Reason:       OOMKilled                                         << CRITICAL
      Exit Code:    137
    Restart Count:  8
    Limits:
      cpu:     1000m
      memory:  2Gi                                                    << TOO LOW
    Requests:
      cpu:     500m
      memory:  1Gi
    Environment:
      JAVA_OPTS:  -Xmx1800m -Xms1800m                                << 90% of container limit, no headroom

Events:
  Warning  Unhealthy  46m  kubelet  Liveness probe failed: HTTP 503
  Warning  OOMKilled  37m  kubelet  Container order-service was OOMKilled (exit 137)
  Warning  OOMKilled  28m  kubelet  Container order-service was OOMKilled (exit 137)
  Warning  OOMKilled  18m  kubelet  Container order-service was OOMKilled (exit 137)
  Warning  OOMKilled  8m   kubelet  Container order-service was OOMKilled (exit 137)
  Warning  OOMKilled  47s  kubelet  Container order-service was OOMKilled (exit 137)
  Warning  BackOff    12s  kubelet  Back-off restarting failed container

$ kubectl top pods -n production -l app=order-service
NAME                              CPU(cores)   MEMORY(bytes)
order-service-7d9c8b6f5-bzc8d    420m         1924Mi               << 94% of 2Gi limit

$ kubectl get hpa order-service-hpa -n production
NAME                REFERENCE                  TARGETS                   MINPODS   MAXPODS
order-service-hpa   Deployment/order-service   <unknown>/70%, 95%/80%    3         10

HPA cannot scale up - metrics-server fails for crashlooping pods.

$ kubectl logs order-service-7d9c8b6f5-9hgxn --previous --tail=15
2024-03-15 14:23:48 INFO  CacheWarmupService - Starting cache warmup
2024-03-15 14:24:12 INFO  CacheWarmupService - Loaded 4,820,293 OrderSummary into LocalOrderCache
2024-03-15 14:24:55 ERROR OrderController - java.lang.OutOfMemoryError: Java heap space
        at com.example.cache.LocalOrderCache.put(LocalOrderCache.java:67)
        at com.example.service.CacheWarmupService.warmup(CacheWarmupService.java:134)
[Pod terminated by kubelet: OOMKilled (exit code 137)]

SUMMARY:
- 4 of 5 pods in CrashLoopBackOff / OOMKilled state
- Memory limit 2Gi insufficient for cache warmup workload
- JAVA_OPTS Xmx=1800m is 90% of container limit - no headroom
- HPA cannot autoscale (no healthy pods for baseline metrics)
- Service unavailable - 504s cascading`,
  },
];

// ── Skill detection ──────────────────────────────────────────
function detectSkill(name: string, content: string): SkillName {
  const ext = name.slice(name.lastIndexOf('.')).toLowerCase();
  const low = content.slice(0, 3000).toLowerCase();
  if (ext === '.sql')        return 'sql-tuning';
  if (ext === '.jfr')        return 'jfr-analysis';
  if (ext === '.hprof')      return 'heap-dump-analysis';
  if (ext === '.har')        return 'ui-console-analysis';
  if (ext === '.csv' || ext === '.jtl') return 'jmeter-analysis';
  if (ext === '.yaml' || ext === '.yml') return 'k8s-analysis';

  const checks: { skill: SkillName; kws: string[] }[] = [
    { skill: 'k8s-analysis',         kws: ['kubectl','crashloopbackoff','oomkilled','pod/','imagepullbackoff','kubernetes','namespace:','replicaset','daemonset'] },
    { skill: 'jmeter-analysis',      kws: ['90% line','error %','throughput','jmeter','aggregate report'] },
    { skill: 'awr-analysis',         kws: ['snap id','db name','awr','load profile','buffer hit','elapsed time'] },
    { skill: 'sql-monitor-analysis', kws: ['sql monitoring','a-rows','e-rows','plan operation','sql_id'] },
    { skill: 'jfr-analysis',         kws: ['jfr','cpusample','gcphasepause','flight recording','gc overhead'] },
    { skill: 'heap-dump-analysis',   kws: ['heap dump','dominator tree','retained heap','outofmemoryerror','leak suspects'] },
    { skill: 'ui-console-analysis',  kws: ['console.log','typeerror','net::err','cors','lcp','core web vitals'] },
    { skill: 'thread-dump-analysis', kws: ['java.lang.thread.state','jstack','nid=','monitor entry','waiting to lock'] },
    { skill: 'stack-trace-analysis', kws: ['caused by','traceback','at com.','at java.','nullpointerexception'] },
    { skill: 'sql-tuning',           kws: ['select','insert','update','delete','from','where'] },
  ];

  let best: SkillName = 'stack-trace-analysis', bestScore = 0;
  for (const c of checks) {
    const score = c.kws.reduce((n, kw) => n + (low.includes(kw) ? 1 : 0), 0);
    if (score > bestScore) { bestScore = score; best = c.skill; }
  }
  return best;
}

// Robust JSON extractor — balanced brace matching, repair, fallback
function extractJSON(raw: string): any {
  if (!raw || typeof raw !== 'string') return null;

  function extractBalanced(str: string): string | null {
    const start = str.indexOf('{');
    if (start === -1) return null;
    let depth = 0, inStr = false, esc = false;
    for (let i = start; i < str.length; i++) {
      const c = str[i];
      if (esc)       { esc = false; continue; }
      if (c === '\\') { esc = true;  continue; }
      if (c === '"')  { inStr = !inStr; continue; }
      if (inStr)     { continue; }
      if (c === '{') { depth++; }
      if (c === '}') { depth--; if (depth === 0) return str.slice(start, i + 1); }
    }
    return null;
  }

  const jsonStr = extractBalanced(raw);
  if (!jsonStr) return null;
  try { return JSON.parse(jsonStr); } catch { /* continue */ }

  const r1 = jsonStr
    .replace(/[\u2018\u2019]/g, "\'").replace(/[\u201C\u201D]/g, '"')
    .replace(/,\s*([}\]])/g, '$1')
    .replace(/\r\n/g, '\\n')
    .replace(/([^\\])\n/g, '$1\\n')
    .replace(/([^\\])\t/g, '$1\\t');
  try { return JSON.parse(r1); } catch { /* continue */ }

  try {
    const r2 = jsonStr.replace(/"((?:[^"\\]|\\[\s\S])*)"/g, (_, inner) =>
      '"' + inner.replace(/[\n\r\t]/g, ' ') + '"'
    );
    const j2 = extractBalanced(r2);
    if (j2) return JSON.parse(j2);
  } catch { /* continue */ }

  const health  = raw.match(/"overallHealth"\s*:\s*"([^"]+)"/)?.[1];
  const summary = raw.match(/"summary"\s*:\s*"([^"\n]+)"/)?.[1];
  const findings: any[] = [];
  for (const m of raw.matchAll(/"severity"\s*:\s*"([^"]+)"[\s\S]*?"title"\s*:\s*"([^"]+)"/g)) {
    findings.push({ id: 'F' + findings.length, severity: m[1], title: m[2], category: '', evidence: '', rootCause: '', impact: '', recommendations: [] });
  }
  if (health) return { overallHealth: health, summary: summary || 'See raw output for details.', keyMetrics: {}, findings };
  return null;
}

// ── Severity styles ──────────────────────────────────────────
const SEV: Record<string, string> = {
  Critical: 'text-red-400 bg-red-400/10 border-red-400/30',
  High:     'text-orange-400 bg-orange-400/10 border-orange-400/30',
  Medium:   'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  Low:      'text-teal-300 bg-teal-300/10 border-teal-300/30',
  Info:     'text-blue-400 bg-blue-400/10 border-blue-400/30',
};

const LAYER_STYLE: Record<string, string> = {
  Database:       'text-blue-400 border-blue-400/25',
  JVM:            'text-purple-400 border-purple-400/25',
  Application:    'text-orange-400 border-orange-400/25',
  Frontend:       'text-yellow-400 border-yellow-400/25',
  Infrastructure: 'text-red-400 border-red-400/25',
  API:            'text-cyan-400 border-cyan-400/25',
};

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────
export default function PerfAgentModal({ onClose }: { onClose: () => void }) {
  const [files, setFiles]         = useState<FileItem[]>(SAMPLES);
  const [active, setActive]       = useState<FileItem | null>(null);
  const [results, setResults]     = useState<Record<string, AnalysisResult>>({});
  const [loading, setLoading]     = useState<string | null>(null);
  const [analyzingAll, setAnalyzingAll] = useState(false);
  const [allProgress, setAllProgress]  = useState<Record<string, 'pending'|'running'|'done'|'error'>>({});
  const [tab, setTab]             = useState<TabName>('findings');
  const [notified, setNotified]   = useState<Set<string>>(new Set());
  const [timeline, setTimeline]   = useState<Timeline | null>(null);
  const [correlating, setCorrelating] = useState(false);
  const [expanded, setExpanded]   = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<{role:'user'|'assistant';content:string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const [lastRetrievedRunbooks, setLastRetrievedRunbooks] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const analyzedCount = files.filter(f => results[f.name]).length;
  const result = active ? results[active.name] : null;
  const meta   = active ? SKILL[active.skill] : null;

  // ── Upload ─────────────────────────────────────────────────
  const handleUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = Array.from(e.target.files || []);
    Promise.all(
      uploaded.map(f => new Promise<FileItem>(res => {
        const r = new FileReader();
        r.onload = ev => {
          const content = (ev.target?.result as string) || '';
          res({ name: f.name, content, skill: detectSkill(f.name, content), size: f.size, isBuiltIn: false });
        };
        r.readAsText(f);
      }))
    ).then(newFiles => {
      setFiles(prev => {
        const names = new Set(newFiles.map(f => f.name));
        return [...prev.filter(f => !names.has(f.name)), ...newFiles];
      });
    });
    e.target.value = '';
  }, []);

  // ── Analyze ────────────────────────────────────────────────
  const analyze = useCallback(async (file: FileItem) => {
    setActive(file);
    setTab('findings');
    if (results[file.name]) return;

    setLoading(file.name);
    try {
      const userMsg = `Analyze this ${file.skill.replace(/-/g, ' ')} diagnostic. Return ONLY raw JSON (no markdown, no fences, start with { end with }):\n\n${file.content.slice(0, 60000)}`;
      // Build RAG query from the file content — top 500 chars + skill name
      const ragQuery = `${file.skill} ${file.content.slice(0, 500)}`;

      const resp = await fetch('/api/perf-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: PROMPTS[file.skill],
          messages: [{ role: 'user', content: userMsg }],
          ragQuery,
        }),
      });
      if (!resp.ok) throw new Error(`API error ${resp.status}`);
      const data = await resp.json();
      const raw  = data.content?.find((b: any) => b.type === 'text')?.text || '';
      const parsed = extractJSON(raw);
      // Capture retrieved runbooks for display
      if (data._rag?.retrieved?.length) setLastRetrievedRunbooks(data._rag.retrieved);
      setResults(prev => ({
        ...prev,
        [file.name]: parsed || {
          overallHealth: 'Fair',
          summary: raw.replace(/`{3,}\w*/g, '').replace(/`{3,}/g, '').trim().slice(0, 300),
          keyMetrics: {}, findings: [],
        },
      }));
    } catch (err: any) {
      alert(`Analysis failed: ${err.message}`);
    } finally {
      setLoading(null);
    }
  }, [results]);

  // ── Analyze All + Correlate (one-click full pipeline) ────────
  const analyzeAll = useCallback(async () => {
    const runStart = Date.now();
    setAnalyzingAll(true);
    setTab('timeline');
    // Init progress state
    const progress: Record<string, 'pending'|'running'|'done'|'error'> = {};
    files.forEach(f => { progress[f.name] = 'pending'; });
    setAllProgress({...progress});

    // Run all skills in parallel
    await Promise.allSettled(
      files.map(async (file) => {
        progress[file.name] = 'running';
        setAllProgress({...progress});
        try {
          const userMsg = `Analyze this ${file.skill.replace(/-/g, ' ')} diagnostic. Return ONLY raw JSON (no markdown, no fences, start with { end with }):

${file.content.slice(0, 60000)}`;
          const ragQuery = `${file.skill} ${file.content.slice(0, 500)}`;
          const resp = await fetch('/api/perf-analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              system: PROMPTS[file.skill],
              messages: [{ role: 'user', content: userMsg }],
              ragQuery,
            }),
          });
          if (!resp.ok) throw new Error(`API error ${resp.status}`);
          const data = await resp.json();
          const raw  = data.content?.find((b: any) => b.type === 'text')?.text || '';
          const parsed = extractJSON(raw);
          setResults(prev => ({
            ...prev,
            [file.name]: parsed || {
              overallHealth: 'Fair',
              summary: raw.replace(/`{3,}\w*/g, '').replace(/`{3,}/g, '').trim().slice(0, 300),
              keyMetrics: {}, findings: [],
            },
          }));
          progress[file.name] = 'done';
        } catch {
          progress[file.name] = 'error';
        }
        setAllProgress({...progress});
      })
    );

    // Now correlate all results
    try {
      const latestResults = await new Promise<Record<string, AnalysisResult>>(resolve => {
        setResults(prev => { resolve(prev); return prev; });
      });
      const analyzed = files.filter(f => latestResults[f.name]);
      if (analyzed.length >= 2) {
        setCorrelating(true);
        const analyses = analyzed.map(f => ({
          fileName: f.name, skill: f.skill,
          result: latestResults[f.name], content: f.content.slice(0, 2000),
        }));
        const resp = await fetch('/api/perf-correlate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ analyses }),
        });
        if (resp.ok) {
          const data = await resp.json();
          const raw  = data.content?.find((b: any) => b.type === 'text')?.text || '';
          const parsed = extractJSON(raw);
          setTimeline(parsed || { rootCause: 'Parse failed', incidentSummary: raw.slice(0,400), overallSeverity: 'Medium', timelineEvents: [], causalChain: [], crossArtifactLinks: [], immediateActions: [] });
          if (parsed) recordRunFromState(parsed, latestResults, analyzed, runStart);
        }
        setCorrelating(false);
      }
    } catch { setCorrelating(false); }

    setAnalyzingAll(false);
  }, [files]);

  // ── Record run into browser-persisted history ──────────────
  const recordRunFromState = useCallback((tl: any, latestResults: Record<string, AnalysisResult>, analyzedFiles: FileItem[], startedMs: number) => {
    const findingsBySeverity: Record<string, number> = {};
    const findingsBySkill: Record<string, number> = {};
    let findingsTotal = 0;
    for (const f of analyzedFiles) {
      const r = latestResults[f.name];
      for (const fd of (r?.findings || [])) {
        findingsTotal++;
        findingsBySeverity[fd.severity] = (findingsBySeverity[fd.severity] || 0) + 1;
        findingsBySkill[f.skill] = (findingsBySkill[f.skill] || 0) + 1;
      }
    }
    saveRunHistory({
      id: 'run-' + Date.now(),
      startedAt: new Date().toISOString(),
      durationMs: Date.now() - startedMs,
      fileCount: analyzedFiles.length,
      overallSeverity: tl?.overallSeverity || 'Info',
      rootCause: tl?.rootCause || '',
      findingsTotal, findingsBySeverity, findingsBySkill,
    });
  }, []);

  // ── Correlate ──────────────────────────────────────────────
  const correlate = useCallback(async () => {
    const analyzed = files.filter(f => results[f.name]);
    if (analyzed.length < 2) return;
    setCorrelating(true);
    setTab('timeline');
    try {
      const analyses = analyzed.map(f => ({
        fileName: f.name, skill: f.skill,
        result: results[f.name], content: f.content.slice(0, 2000),
      }));
      const resp = await fetch('/api/perf-correlate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analyses }),
      });
      if (!resp.ok) throw new Error(`API error ${resp.status}`);
      const data = await resp.json();
      const raw  = data.content?.find((b: any) => b.type === 'text')?.text || '';
      const parsed = extractJSON(raw);
      setTimeline(parsed || {
        rootCause: 'Parse failed — try again', incidentSummary: raw.slice(0, 400),
        overallSeverity: 'Medium', timelineEvents: [], causalChain: [],
        crossArtifactLinks: [], immediateActions: [],
      });
    } catch (err: any) {
      alert(`Correlation failed: ${err.message}`);
    } finally {
      setCorrelating(false);
    }
  }, [files, results]);

  // ── Chat ───────────────────────────────────────────────────
  const sendChatMessage = useCallback(async () => {
    const text = chatInput.trim();
    if (!text || chatSending) return;

    const newHistory = [...chatMessages, { role: 'user' as const, content: text }];
    setChatMessages(newHistory);
    setChatInput('');
    setChatSending(true);

    try {
      // Build incident context from current state
      const incidentContext = {
        rootCause: timeline?.rootCause || '',
        summary:   timeline?.incidentSummary || '',
        severity:  timeline?.overallSeverity || '',
        findings:  Object.entries(results).flatMap(([fileName, r]) =>
          (r.findings || []).slice(0, 3).map((f: Finding) => ({
            file: fileName, severity: f.severity, title: f.title, evidence: f.evidence,
          }))
        ).slice(0, 12),
      };

      const systemPrompt = `You are an expert SRE / Performance Engineering copilot helping with this specific incident.
Be direct and technical. Cite specific evidence when relevant. Never invent metrics.

CURRENT INCIDENT:
Root cause: ${incidentContext.rootCause}
Severity: ${incidentContext.severity}
Summary: ${incidentContext.summary}

Top findings:
${incidentContext.findings.map(f => `  [${f.severity}] ${f.file}: ${f.title} — ${f.evidence}`).join('\n')}

If asked to write a Slack message, Jira ticket, or status update, use proper formatting.`;

      // RAG: use the user's latest question as the retrieval query
      const ragQuery = text;
      const resp = await fetch('/api/perf-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system: systemPrompt, messages: newHistory, ragQuery }),
      });
      if (!resp.ok) throw new Error(`API error ${resp.status}`);
      const data  = await resp.json();
      const reply = data.content?.find((b: any) => b.type === 'text')?.text || 'No response';
      setChatMessages([...newHistory, { role: 'assistant', content: reply }]);
    } catch (err: any) {
      setChatMessages([...newHistory, { role: 'assistant', content: `Error: ${err.message}` }]);
    } finally {
      setChatSending(false);
    }
  }, [chatInput, chatMessages, chatSending, results, timeline]);

  // ── Render ─────────────────────────────────────────────────
  const showTimeline = analyzedCount >= 2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-6xl h-[90vh] bg-[#08090c] border border-gray-800 rounded-xl overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800 bg-[#0e1017] flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-300 animate-pulse shadow-[0_0_8px_#5eead4]" />
            <span className="font-mono font-bold tracking-widest text-sm" style={{color:"#5eead4"}}>OPSMIND</span>
            <span className="text-[10px] text-gray-600 border border-gray-800 px-2 py-0.5 rounded">AI PERFORMANCE DIAGNOSTICS</span>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors text-lg leading-none">✕</button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">

          {/* Sidebar */}
          <div className="w-64 flex-shrink-0 border-r border-gray-800 flex flex-col bg-[#0e1017]">

            {/* File count */}
            {files.length > 0 && (
              <div className="px-4 py-2 border-b border-gray-800 flex items-center justify-between text-[10px] font-mono">
                <span className="text-teal-300 font-semibold">{files.length} files</span>
                {analyzedCount > 0 && <span className="text-gray-600">{analyzedCount} analyzed</span>}
              </div>
            )}

            {/* Action buttons */}
            {files.length >= 2 && (
              <div className="px-3 py-2 border-b border-gray-800 flex flex-col gap-1.5">
                <button
                  onClick={analyzeAll}
                  disabled={analyzingAll || correlating}
                  className="w-full py-2 text-[10px] font-mono font-bold rounded border border-teal-300/50 bg-teal-300/10 text-teal-300 hover:bg-teal-300/15 transition-colors disabled:opacity-50"
                >
                  {analyzingAll ? '⏳ Analyzing...' : `🚀 Analyze All ${files.length} + Timeline`}
                </button>
                {analyzedCount >= 2 && (
                  <button
                    onClick={correlate}
                    disabled={correlating || analyzingAll}
                    className="w-full py-1.5 text-[9px] font-mono rounded border border-teal-300/25 text-teal-300/70 hover:text-teal-300 hover:border-teal-300/40 transition-colors disabled:opacity-50"
                  >
                    {correlating ? '⚡ Correlating...' : `⚡ Correlate ${analyzedCount} analyzed`}
                  </button>
                )}
              </div>
            )}

            {/* File list */}
            <div className="flex-1 overflow-y-auto">
              {files.map(f => {
                const m       = SKILL[f.skill];
                const done    = !!results[f.name];
                const isActive = active?.name === f.name;
                const busy    = loading === f.name;

                return (
                  <button
                    key={f.name}
                    onClick={() => analyze(f)}
                    className={`w-full text-left px-4 py-3 border-l-2 transition-all ${
                      isActive ? 'border-teal-300 bg-teal-300/5' : 'border-transparent hover:bg-gray-900'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-base mt-0.5">{m.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-mono truncate text-white/90">{f.name}</div>
                        <div className="text-[10px] text-gray-600 mt-0.5">{Math.round(f.size / 1024)}KB {f.isBuiltIn ? '· sample' : '· uploaded'}</div>
                        <span className="inline-block mt-1 text-[9px] px-2 py-0.5 rounded font-semibold uppercase tracking-wide"
                          style={{ color: m.color, background: `${m.color}18`, border: `1px solid ${m.color}40` }}>
                          {m.label}
                        </span>
                      </div>
                      <span className="text-xs flex-shrink-0 mt-1">
                        {busy ? <span className="animate-spin inline-block">⟳</span> : done ? '✅' : '○'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Upload */}
            <div className="p-3 border-t border-gray-800">
              <input ref={fileRef} type="file" multiple className="hidden"
                accept=".html,.htm,.txt,.log,.sql,.jfr,.hprof,.har,.json,.csv,.jtl"
                onChange={handleUpload} />
              <button onClick={() => fileRef.current?.click()}
                className="w-full py-2 text-[10px] font-mono text-gray-600 border border-gray-800 rounded hover:border-gray-700 hover:text-white/70 transition-colors">
                📁 Upload your own files
              </button>
            </div>
          </div>

          {/* Main */}
          <div className="flex-1 flex flex-col overflow-hidden">

            {/* Tabs */}
            <div className="flex border-b border-gray-800 bg-[#0e1017] flex-shrink-0 overflow-x-auto">
              {(['findings', 'routing', 'pipeline', ...(showTimeline ? ['timeline', 'chat'] : []), 'runs'] as TabName[]).map(t => (
                <button key={t}
                  onClick={() => { setTab(t); if (t === 'timeline' && !timeline && !correlating) correlate(); }}
                  className={`px-4 py-3 text-xs font-mono whitespace-nowrap border-b-2 transition-all ${
                    tab === t ? 'border-teal-300 text-teal-300' : 'border-transparent text-gray-600 hover:text-white/70'
                  }`}>
                  {t === 'timeline' ? '⚡ ' : t === 'chat' ? '💬 ' : t === 'runs' ? '📊 ' : ''}{t.charAt(0).toUpperCase() + t.slice(1)}
                  {t === 'findings' && result && <span className="ml-1.5 text-[9px] px-1.5 py-0.5 rounded-full bg-gray-800 text-gray-500">{result.findings?.length || 0}</span>}
                  {t === 'timeline' && timeline && <span className="ml-1.5 text-[9px] px-1.5 py-0.5 rounded-full bg-teal-300/15 text-teal-300">{timeline.timelineEvents?.length || 0}</span>}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">

              {/* Empty */}
              {!active && tab !== 'timeline' && (
                <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
                  <div className="text-5xl opacity-20">🔬</div>
                  <div className="font-mono text-gray-800 text-2xl font-bold tracking-widest">OPSMIND</div>
                  <div className="text-xs text-gray-600 max-w-xs leading-relaxed">
                    Click any file to analyze it. Use the built-in samples or upload your own diagnostic files.
                    Analyze 2+ files to unlock the ⚡ Incident Timeline.
                  </div>
                </div>
              )}

              {/* Loading */}
              {loading && active?.name === loading && !result && (
                <div className="h-full flex flex-col items-center justify-center gap-6">
                  <div className="relative w-14 h-14">
                    <div className="absolute inset-0 rounded-full border-2 border-gray-800 border-t-green-400 animate-spin" />
                    <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-amber-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.5s' }} />
                  </div>
                  <div className="text-xs font-mono text-gray-600">Analyzing {active?.name} with {active?.skill}...</div>
                </div>
              )}

              {/* Findings */}
              {tab === 'findings' && result && active && !loading && (
                <FindingsPanel result={result} file={active} meta={meta!} expanded={expanded} onToggle={setExpanded}
                  retrievedRunbooks={lastRetrievedRunbooks} />
              )}

              {/* Routing */}
              {tab === 'routing' && result && active && meta && (
                <RoutingPanel result={result} team={meta.team} isCritical={result.overallHealth === 'Critical' || result.findings?.some(f => f.severity === 'Critical')} notified={notified} onNotify={(t) => setNotified(prev => new Set([...prev, t]))} />
              )}

              {/* Pipeline */}
              {tab === 'pipeline' && result && active && (
                <PipelinePanel result={result} file={active} />
              )}

              {/* Timeline */}
              {tab === 'timeline' && (
                <TimelinePanel timeline={timeline} correlating={correlating} analyzing={analyzingAll} progress={allProgress} count={analyzedCount} />
              )}

              {tab === 'runs' && <RunsPanel />}

              {tab === 'chat' && (
                <ChatPanel
                  messages={chatMessages}
                  input={chatInput}
                  setInput={setChatInput}
                  onSend={sendChatMessage}
                  sending={chatSending}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SUB-PANELS
// ─────────────────────────────────────────────────────────────

function FindingsPanel({ result, file, meta, expanded, onToggle, retrievedRunbooks = [] }: {
  result: AnalysisResult; file: FileItem;
  meta: typeof SKILL[SkillName]; expanded: string | null;
  onToggle: (id: string | null) => void;
  retrievedRunbooks?: string[];
}) {
  const hc = result.overallHealth || 'Fair';
  const hColor: Record<string, string> = { Critical: 'text-red-400', Degraded: 'text-orange-400', High: 'text-orange-400', Fair: 'text-yellow-400', Medium: 'text-yellow-400', Good: 'text-teal-300', Low: 'text-teal-300' };
  const hBorder: Record<string, string> = { Critical: 'border-red-400/25 bg-red-400/5', Degraded: 'border-orange-400/25 bg-orange-400/5', Fair: 'border-yellow-400/20 bg-yellow-400/5', Good: 'border-teal-300/20 bg-teal-300/5' };

  return (
    <div className="space-y-4">
      <div className={`flex items-center gap-4 p-4 border rounded-lg ${hBorder[hc] || 'border-gray-800'}`}>
        <div>
          <div className={`font-mono text-3xl font-bold tracking-wider ${hColor[hc] || 'text-white'}`}>{hc}</div>
          <div className="text-[10px] text-gray-600 mt-1">{meta.icon} {file.name}</div>
        </div>
        <div className="text-xs text-white/70 leading-relaxed">{result.summary}</div>
      </div>

      {retrievedRunbooks.length > 0 && (
        <div className="border border-purple-400/30 bg-purple-400/5 rounded-lg p-3">
          <div className="text-[9px] text-purple-400 font-bold uppercase tracking-widest mb-2">
            📚 RAG · Retrieved {retrievedRunbooks.length} relevant runbook{retrievedRunbooks.length > 1 ? 's' : ''}
          </div>
          <div className="space-y-1">
            {retrievedRunbooks.map((title, i) => (
              <div key={i} className="text-[11px] text-white/70 flex items-center gap-2">
                <span className="text-purple-400/70">▸</span>
                <span>{title}</span>
              </div>
            ))}
          </div>
          <div className="text-[9px] text-white/40 mt-2 italic">
            Claude analyzed this file with context from your team\'s runbooks.
          </div>
        </div>
      )}

      {Object.entries(result.keyMetrics || {}).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(result.keyMetrics).slice(0, 6).map(([k, v]) => (
            <div key={k} className="bg-gray-900 border border-gray-800 rounded px-3 py-2">
              <div className="text-[9px] text-gray-600 uppercase tracking-widest mb-1">{k.replace(/_/g, ' ')}</div>
              <div className="text-xs font-mono text-white">{v}</div>
            </div>
          ))}
        </div>
      )}

      <div>
        <div className="text-[9px] text-gray-600 uppercase tracking-widest mb-2 flex items-center gap-2">
          Findings ({result.findings?.length || 0})<div className="flex-1 h-px bg-gray-800" />
        </div>
        <div className="space-y-2">
          {(result.findings || []).map(f => (
            <div key={f.id} className="border border-gray-800 rounded-lg overflow-hidden bg-gray-900">
              <button onClick={() => onToggle(expanded === f.id ? null : f.id)}
                className="w-full flex items-center gap-2 p-3 text-left hover:bg-gray-800 transition-colors">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider font-mono ${SEV[f.severity] || ''}`}>{f.severity}</span>
                <span className="text-xs flex-1 font-medium text-white/90">{f.title}</span>
                <span className="text-[9px] text-gray-600 bg-gray-800 border border-gray-700 px-2 py-0.5 rounded">{f.category}</span>
                <span className="text-gray-600 text-xs">{expanded === f.id ? '▼' : '▶'}</span>
              </button>
              {expanded === f.id && (
                <div className="px-3 pb-3 border-t border-gray-800 space-y-3">
                  {[['Evidence', f.evidence], ['Root Cause', f.rootCause], ['Impact', f.impact]].map(([label, text]) =>
                    text ? (
                      <div key={label} className="mt-3">
                        <div className="text-[9px] text-gray-600 uppercase tracking-widest mb-1">{label}</div>
                        <div className="text-[11px] text-white/70 leading-relaxed">{text}</div>
                      </div>
                    ) : null
                  )}
                  {f.recommendations?.length > 0 && (
                    <div>
                      <div className="text-[9px] text-gray-600 uppercase tracking-widest mb-2">Recommendations</div>
                      <div className="space-y-1.5">
                        {f.recommendations.map((r, i) => (
                          <div key={i} className="flex gap-2 items-start p-2 bg-gray-950 rounded border border-gray-800 text-[11px]">
                            <span className="w-4 h-4 rounded-full bg-teal-300/10 border border-teal-300/25 text-teal-300 text-[9px] flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                            <span className="text-white/75 leading-relaxed">{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {!result.findings?.length && <div className="text-center py-8 text-gray-600 text-xs">✅ No significant issues found</div>}
        </div>
      </div>
    </div>
  );
}

function RoutingPanel({ result, team, isCritical, notified, onNotify }: {
  result: AnalysisResult; team: string; isCritical: boolean;
  notified: Set<string>; onNotify: (t: string) => void;
}) {
  const teams = [team, ...(isCritical ? ['On-Call (Critical Override)'] : [])];
  return (
    <div className="space-y-4">
      <div className="text-xs text-white/70 leading-relaxed">
        Severity <span className="text-white font-semibold">{result.overallHealth}</span> routes to{' '}
        <span className="text-teal-300 font-mono">{team}</span>.
        {isCritical && <span className="text-red-400"> Critical override adds On-Call.</span>}
      </div>
      {teams.map(t => (
        <div key={t} className={`border rounded-lg p-4 ${notified.has(t) ? 'border-teal-300/30 bg-teal-300/5' : 'border-gray-800 bg-gray-900'}`}>
          <div className="font-mono font-bold text-sm mb-3">{t}</div>
          <div className="flex gap-2 mb-3">
            <span className="text-[9px] text-blue-400 border border-blue-400/25 bg-blue-400/6 px-2 py-0.5 rounded">Slack</span>
            <span className="text-[9px] text-indigo-400 border border-indigo-400/25 bg-indigo-400/6 px-2 py-0.5 rounded">Jira</span>
            <span className="text-[9px] text-amber-400 border border-amber-400/25 bg-amber-400/6 px-2 py-0.5 rounded">Email</span>
          </div>
          <button onClick={() => onNotify(t)}
            className={`w-full py-2 text-[10px] font-mono rounded border transition-colors ${notified.has(t) ? 'border-teal-300/25 text-teal-300' : 'border-gray-700 text-gray-600 hover:border-teal-300/40 hover:text-teal-300'}`}>
            {notified.has(t) ? '✓ Notification sent (demo)' : '→ Notify this team'}
          </button>
        </div>
      ))}
      <div className="text-[10px] text-gray-600 leading-relaxed border border-gray-800 rounded p-3 bg-gray-900">
        <strong className="text-white/50">In production:</strong> posts Slack Block Kit, creates Jira ticket with severity labels, sends HTML email with Word report attached.
      </div>
    </div>
  );
}

function PipelinePanel({ result, file }: { result: AnalysisResult; file: FileItem }) {
  const steps = [
    { icon: '📥', name: 'File Detected',    desc: `${file.name} classified as ${file.skill}` },
    { icon: '🧠', name: 'Classifier Agent', desc: `Skill: ${file.skill} · Health: ${result.overallHealth}` },
    { icon: '⚡', name: 'Analysis Agent',   desc: `Claude API called · ${result.findings?.length || 0} findings returned` },
    { icon: '📋', name: 'Report Compiled',  desc: `Findings severity-ranked · ${result.findings?.filter(f => f.severity === 'Critical').length || 0} critical` },
    { icon: '📢', name: 'Teams Notified',   desc: 'Slack Block Kit + Jira + HTML email sent to routed team' },
  ];
  return (
    <div className="space-y-1">
      <div className="font-mono text-sm font-bold text-white/80 mb-4">Agent Pipeline — {file.name}</div>
      {steps.map((s, i) => (
        <div key={i} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="w-9 h-9 rounded-full border-2 border-teal-300 bg-teal-300/8 flex items-center justify-center text-sm z-10">{s.icon}</div>
            {i < steps.length - 1 && <div className="w-0.5 flex-1 bg-teal-300/25 my-0.5 min-h-[20px]" />}
          </div>
          <div className="pb-5 pt-1.5 flex-1">
            <div className="font-mono font-bold text-sm mb-1">{s.name}</div>
            <div className="text-[11px] text-gray-600 leading-relaxed">{s.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TimelinePanel({ timeline, correlating, analyzing, progress, count }: {
  timeline: Timeline | null; correlating: boolean;
  analyzing: boolean; progress: Record<string,string>;
  count: number;
}) {
  if (count < 2) return (
    <div className="h-full flex items-center justify-center text-gray-600 text-sm">Analyze 2+ files to enable correlation.</div>
  );

  if (analyzing) return (
    <div className="h-full flex flex-col items-center justify-center gap-5">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-2 border-gray-800 border-t-green-400 animate-spin" />
        <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-amber-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.5s' }} />
      </div>
      <div className="text-xs font-mono text-gray-600 text-center">Running all skills in parallel...</div>
      {progress && Object.entries(progress).map(([name, state]) => (
        <div key={name} className="text-[10px] font-mono">
          {state === 'pending' && <span className="text-gray-700">○ {name}</span>}
          {state === 'running' && <span className="text-amber-400">⟳ {name}</span>}
          {state === 'done'    && <span className="text-teal-300">✓ {name}</span>}
          {state === 'error'   && <span className="text-red-400">✗ {name}</span>}
        </div>
      ))}
      {correlating && <div className="text-[10px] font-mono text-amber-400">⚡ Building incident timeline...</div>}
    </div>
  );

  if (correlating && !analyzing) return (
    <div className="h-full flex flex-col items-center justify-center gap-6">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-2 border-gray-800 border-t-green-400 animate-spin" />
        <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-amber-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.5s' }} />
      </div>
      <div className="text-xs font-mono text-gray-600">Building incident timeline across {count} artifacts...</div>
    </div>
  );

  if (!timeline) return null;

  return (
    <div className="space-y-5">
      {/* Root cause */}
      <div className="border border-red-400/30 bg-red-400/5 rounded-lg p-4">
        <div className="text-[9px] text-red-400 font-bold uppercase tracking-widest mb-2">🎯 Root Cause</div>
        <div className="text-sm font-medium text-white leading-relaxed">{timeline.rootCause}</div>
      </div>

      {/* Summary */}
      <div className="text-xs text-white/60 leading-relaxed border border-gray-800 rounded p-3 bg-gray-900">{timeline.incidentSummary}</div>

      {/* Stats */}
      <div className="flex gap-2 flex-wrap">
        {[
          { label: 'Severity',  value: timeline.overallSeverity, extra: 'text-red-400' },
          { label: 'Events',    value: `${timeline.timelineEvents?.length || 0}`,  extra: '' },
          { label: 'Causal Steps', value: `${timeline.causalChain?.length || 0}`,  extra: '' },
          { label: 'Links',     value: `${timeline.crossArtifactLinks?.length || 0}`, extra: 'text-teal-300' },
        ].map(s => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded px-3 py-2">
            <div className="text-[9px] text-gray-600 uppercase tracking-widest mb-1">{s.label}</div>
            <div className={`text-sm font-bold font-mono ${s.extra || 'text-white'}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Events */}
      {timeline.timelineEvents?.length > 0 && (
        <div>
          <div className="text-[9px] text-gray-600 uppercase tracking-widest mb-3 flex items-center gap-2">Timeline <div className="flex-1 h-px bg-gray-800" /></div>
          <div className="relative pl-5">
            <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-gray-800 rounded" />
            <div className="space-y-2.5">
              {timeline.timelineEvents.map((e, i) => (
                <div key={i} className="relative border border-gray-800 bg-gray-900 rounded-lg p-3">
                  <div className="absolute -left-[17px] top-4 w-2.5 h-2.5 rounded-full border-2 border-gray-700 bg-gray-900" />
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-teal-300 font-mono text-[10px]">{e.timestamp}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border font-mono ${LAYER_STYLE[e.layer] || 'text-gray-600 border-gray-800'}`}>{e.layer}</span>
                    {e.linkedTo?.length > 0 && <span className="text-teal-300 text-[9px]">🔗 {e.linkedTo.join(', ')}</span>}
                    <span className="ml-auto text-[9px] text-gray-600 font-mono">{e.artifact}</span>
                  </div>
                  <div className="text-xs font-medium text-white/90 mb-1">{e.event}</div>
                  {e.evidence && <div className="text-[10px] text-gray-600 font-mono">{e.evidence}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Causal chain */}
      {timeline.causalChain?.length > 0 && (
        <div>
          <div className="text-[9px] text-gray-600 uppercase tracking-widest mb-3 flex items-center gap-2">Causal Chain <div className="flex-1 h-px bg-gray-800" /></div>
          <div className="space-y-2">
            {timeline.causalChain.map((s, i) => (
              <div key={i} className="flex border border-gray-800 bg-gray-900 rounded-lg overflow-hidden">
                <div className="w-8 bg-gray-950 border-r border-gray-800 flex items-center justify-center text-teal-300 font-mono text-xs font-bold">{i + 1}</div>
                <div className="p-3 flex-1">
                  <div className="text-xs font-medium text-white/90 mb-1">{s.cause}</div>
                  <div className="flex items-center gap-2 text-[10px] text-gray-600">
                    <span className="text-red-400">▼</span>
                    <span className="text-teal-300 bg-teal-300/8 border border-teal-300/20 px-1.5 py-0.5 rounded text-[9px]">{s.linkType}</span>
                    <span className="text-white/70">{s.effect}</span>
                  </div>
                  <div className="text-[9px] text-gray-600 font-mono mt-1">{s.sourceArtifact} → {s.targetArtifact}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cross-artifact links */}
      {timeline.crossArtifactLinks?.length > 0 && (
        <div>
          <div className="text-[9px] text-gray-600 uppercase tracking-widest mb-3 flex items-center gap-2">Cross-Artifact Links <div className="flex-1 h-px bg-gray-800" /></div>
          <div className="space-y-2">
            {timeline.crossArtifactLinks.map((lk, i) => (
              <div key={i} className="flex gap-3 border border-gray-800 bg-gray-900 rounded-lg p-3">
                <span className="text-[9px] text-teal-300 bg-teal-300/8 border border-teal-300/20 px-2 py-0.5 rounded font-mono flex-shrink-0 h-fit">{lk.entityType}</span>
                <div>
                  <div className="text-xs font-medium text-white/90 mb-0.5">{lk.entityValue.slice(0, 80)}</div>
                  <div className="text-[10px] text-gray-600 font-mono mb-0.5">{lk.appearsIn.join(' · ')}</div>
                  <div className="text-[10px] text-white/50">{lk.significance}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Immediate actions */}
      {timeline.immediateActions?.length > 0 && (
        <div>
          <div className="text-[9px] text-gray-600 uppercase tracking-widest mb-3 flex items-center gap-2">Immediate Actions <div className="flex-1 h-px bg-gray-800" /></div>
          <div className="space-y-1.5">
            {timeline.immediateActions.map((a, i) => (
              <div key={i} className="flex gap-2.5 items-start p-2.5 bg-gray-900 border border-gray-800 rounded text-[11px]">
                <span className="w-4 h-4 rounded-full bg-teal-300/10 border border-teal-300/25 text-teal-300 text-[9px] flex items-center justify-center flex-shrink-0 mt-0.5 font-mono">{i + 1}</span>
                <span className="text-white/75 leading-relaxed">{a}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


// ─────────────────────────────────────────────────────────────
// ChatPanel — conversational follow-up over the incident
// ─────────────────────────────────────────────────────────────
function ChatPanel({ messages, input, setInput, onSend, sending }: {
  messages: { role: 'user'|'assistant'; content: string }[];
  input: string;
  setInput: (v: string) => void;
  onSend: () => void;
  sending: boolean;
}) {
  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',gap:'12px'}}>
      <div style={{padding:'12px 16px',background:'rgba(94,234,212,0.06)',
                   border:'1px solid rgba(94,234,212,0.25)',borderRadius:'8px',flexShrink:0}}>
        <div style={{fontSize:'11px',color:'#5eead4',fontWeight:600,fontFamily:'monospace',letterSpacing:'0.5px'}}>
          💬 SRE COPILOT
        </div>
        <div style={{fontSize:'10px',color:'#6b7280',marginTop:4}}>
          Ask follow-up questions: "Which finding first?" · "Write a Jira ticket" · "Summarize for my manager"
        </div>
      </div>

      <div style={{flex:1,overflowY:'auto',display:'flex',flexDirection:'column',gap:'10px',padding:'4px'}}>
        {messages.length === 0 ? (
          <div style={{textAlign:'center',padding:'40px 20px',color:'#6b7280',fontSize:'11px'}}>
            No messages yet. Ask anything about the incident below.
          </div>
        ) : messages.map((m, i) => {
          const isUser = m.role === 'user';
          return (
            <div key={i} style={{display:'flex',flexDirection:'column',gap:'4px',
                                  alignItems: isUser ? 'flex-end' : 'flex-start'}}>
              <div style={{fontFamily:'monospace',fontSize:'9px',color:'#6b7280',letterSpacing:'1px'}}>
                {isUser ? 'YOU' : 'OPSMIND'}
              </div>
              <div style={{
                maxWidth:'75%',padding:'10px 14px',
                background: isUser ? 'rgba(94,234,212,0.08)' : '#111827',
                border: `1px solid ${isUser ? 'rgba(94,234,212,0.25)' : '#1f2937'}`,
                borderRadius:'8px',
                color: isUser ? '#5eead4' : '#e5e7eb',
                fontSize:'12px',lineHeight:1.55,whiteSpace:'pre-wrap'}}>
                {m.content}
              </div>
            </div>
          );
        })}
        {sending && (
          <div style={{color:'#6b7280',fontSize:'11px',padding:'8px',fontFamily:'monospace'}}>
            PerfAgent is thinking...
          </div>
        )}
      </div>

      <div style={{display:'flex',gap:'8px',flexShrink:0,paddingTop:'8px',borderTop:'1px solid #1f2937'}}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onSend()}
          placeholder="Ask about this incident..."
          disabled={sending}
          style={{flex:1,padding:'8px 12px',background:'#111827',border:'1px solid #1f2937',
                  color:'#e5e7eb',fontFamily:'monospace',fontSize:'11px',borderRadius:'6px',outline:'none'}}
        />
        <button
          onClick={onSend}
          disabled={sending || !input.trim()}
          style={{padding:'8px 16px',background:'rgba(94,234,212,0.12)',
                  border:'1px solid #5eead4',color:'#5eead4',
                  fontFamily:'monospace',fontSize:'11px',fontWeight:600,
                  borderRadius:'6px',cursor:sending ? 'not-allowed' : 'pointer',
                  opacity: sending ? 0.5 : 1}}>
          Send
        </button>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────
// RunsPanel — dashboard of previous OpsMind runs
// (browser-persisted history; production uses /runs API + JSONL log)
// ─────────────────────────────────────────────────────────────
function RunsPanel() {
  const runs = loadRunHistory();

  if (runs.length === 0) {
    return (
      <div style={{textAlign:'center',padding:'60px 20px',color:'#6b7280',fontSize:'12px',lineHeight:1.7}}>
        No runs recorded yet.
        <br /><br />
        Run <b style={{color:'#5eead4'}}>Analyze All + Timeline</b> and it will be saved here automatically.
      </div>
    );
  }

  // Aggregate
  const sevColors: Record<string, string> = {
    Critical: '#ff5064', High: '#ff8246', Medium: '#fbbf24', Low: '#5eead4', Info: '#6b7280',
  };
  const sevTotals: Record<string, number> = {};
  const skillTotals: Record<string, number> = {};
  let totFindings = 0, totDuration = 0;
  for (const r of runs) {
    totFindings += r.findingsTotal;
    totDuration += r.durationMs;
    for (const k in r.findingsBySeverity) sevTotals[k] = (sevTotals[k] || 0) + r.findingsBySeverity[k];
    for (const k in r.findingsBySkill)    skillTotals[k] = (skillTotals[k] || 0) + r.findingsBySkill[k];
  }
  const sevMax   = Math.max(1, ...Object.values(sevTotals));
  const skillMax = Math.max(1, ...Object.values(skillTotals));

  const cards: [string, string | number][] = [
    ['Total runs', runs.length],
    ['Total findings', totFindings],
    ['Avg duration', Math.round(totDuration / runs.length / 1000) + 's'],
    ['Critical findings', sevTotals.Critical || 0],
  ];

  const Bar = ({ label, value, max, color }: { label: string; value: number; max: number; color: string }) => (
    <div style={{display:'flex',alignItems:'center',gap:'10px',margin:'6px 0'}}>
      <div style={{width:'120px',fontFamily:'monospace',fontSize:'10px',color:'#6b7280',textAlign:'right',flexShrink:0}}>{label}</div>
      <div style={{flex:1,height:'14px',background:'#111827',borderRadius:'3px',overflow:'hidden'}}>
        <div style={{width:(max > 0 ? Math.round(value / max * 100) : 0) + '%',height:'100%',background:color,borderRadius:'3px'}} />
      </div>
      <div style={{width:'32px',fontFamily:'monospace',fontSize:'11px',color:'#e5e7eb'}}>{value}</div>
    </div>
  );

  return (
    <div style={{display:'flex',flexDirection:'column',gap:'20px'}}>
      <div style={{fontFamily:'monospace',fontSize:'11px',color:'#5eead4',letterSpacing:'1px'}}>
        📊 RUN HISTORY — {runs.length} RECORDED RUN{runs.length > 1 ? 'S' : ''}
      </div>

      <div style={{display:'flex',gap:'12px',flexWrap:'wrap'}}>
        {cards.map(([label, value]) => (
          <div key={label} style={{flex:1,minWidth:'130px',background:'#111827',border:'1px solid #1f2937',borderRadius:'8px',padding:'14px 16px'}}>
            <div style={{fontFamily:'monospace',fontSize:'22px',color:'#5eead4'}}>{value}</div>
            <div style={{fontSize:'10px',color:'#6b7280',marginTop:'4px'}}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'24px'}}>
        <div>
          <div style={{fontFamily:'monospace',fontSize:'10px',color:'#6b7280',letterSpacing:'1px',marginBottom:'8px'}}>FINDINGS BY SEVERITY</div>
          {['Critical','High','Medium','Low','Info'].filter(s => sevTotals[s]).map(s => (
            <Bar key={s} label={s} value={sevTotals[s]} max={sevMax} color={sevColors[s]} />
          ))}
        </div>
        <div>
          <div style={{fontFamily:'monospace',fontSize:'10px',color:'#6b7280',letterSpacing:'1px',marginBottom:'8px'}}>FINDINGS BY SKILL</div>
          {Object.entries(skillTotals).sort((a, b) => b[1] - a[1]).map(([s, v]) => (
            <Bar key={s} label={SKILL[s as SkillName]?.label || s} value={v} max={skillMax} color={SKILL[s as SkillName]?.color || '#5eead4'} />
          ))}
        </div>
      </div>

      <div>
        <div style={{fontFamily:'monospace',fontSize:'10px',color:'#6b7280',letterSpacing:'1px',marginBottom:'8px'}}>RECENT RUNS</div>
        <div style={{background:'#111827',border:'1px solid #1f2937',borderRadius:'8px',overflow:'hidden'}}>
          {runs.slice(0, 15).map((r, i) => (
            <div key={r.id} style={{display:'grid',gridTemplateColumns:'150px 70px 80px 60px 1fr',gap:'10px',padding:'9px 12px',
                                     borderTop: i > 0 ? '1px solid #1f2937' : 'none',alignItems:'center'}}>
              <span style={{fontFamily:'monospace',fontSize:'10px',color:'#6b7280'}}>{r.startedAt.replace('T',' ').slice(0,19)}</span>
              <span style={{fontSize:'11px',color:'#e5e7eb'}}>{r.fileCount} files</span>
              <span style={{fontFamily:'monospace',fontSize:'10px',color:sevColors[r.overallSeverity] || '#6b7280'}}>{r.overallSeverity}</span>
              <span style={{fontSize:'11px',color:'#e5e7eb'}}>{r.findingsTotal}</span>
              <span style={{fontSize:'10px',color:'#6b7280',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.rootCause || '—'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
