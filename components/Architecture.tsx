const STACK = [
  { layer: "Frontend",        tools: "Next.js (React), TypeScript, Tailwind CSS",                                     signal: "teal" },
  { layer: "Backend",         tools: "Node.js, Express, REST APIs, streaming SSE",                                     signal: "teal" },
  { layer: "AI / LLM",        tools: "Anthropic Claude (claude-sonnet-4.5), multi-agent orchestration, RAG pipelines", signal: "amber" },
  { layer: "Vector DB",       tools: "Pinecone, OpenAI embeddings (text-embedding-3-small)",                           signal: "amber" },
  { layer: "Cloud",           tools: "OCI, AWS (ECS Fargate, S3, CloudWatch, Lambda), Vercel",                         signal: "teal" },
  { layer: "Databases",       tools: "Oracle Autonomous DB, PostgreSQL, AWS RDS / Aurora",                             signal: "teal" },
  { layer: "Containers / IaC",tools: "Docker, Kubernetes (CKA), Helm, Terraform",                                      signal: "teal" },
  { layer: "Observability",   tools: "Prometheus, Grafana, OEM, CloudWatch, AppDynamics, LLMOps metrics",              signal: "teal" },
  { layer: "Notifications",   tools: "Slack Block Kit, Jira REST API, SMTP / HTML email",                              signal: "teal" },
  { layer: "CI/CD",           tools: "GitHub Actions, AWS CodePipeline, automated SQL gate",                           signal: "teal" },
];

export default function Architecture() {
  return (
    <section id="architecture" className="px-6 py-20 max-w-6xl mx-auto">
      <div className="section-head">
        <div className="eyebrow">stack</div>
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
          System architecture
        </h2>
      </div>

      <div className="panel overflow-hidden">
        {STACK.map((row, i) => (
          <div
            key={row.layer}
            className={`grid grid-cols-[140px_1fr] md:grid-cols-[200px_1fr] gap-4 px-5 py-4 ${
              i !== 0 ? "border-t border-[var(--line-soft)]" : ""
            }`}
          >
            <div
              className={`font-mono text-xs tracking-wider uppercase pt-0.5 ${
                row.signal === "amber" ? "text-[var(--amber)]" : "text-[var(--teal)]"
              }`}
            >
              {row.layer}
            </div>
            <div className="text-sm text-[var(--ink-soft)]">{row.tools}</div>
          </div>
        ))}
      </div>

      <p className="font-mono text-[11px] text-[var(--ink-dim)] mt-3 text-center">
        amber = AI/LLM layer · added 2026 with OpsMind
      </p>
    </section>
  );
}
