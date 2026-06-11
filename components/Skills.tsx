const GROUPS = [
  {
    title: "SRE / Reliability",
    items: ["SLOs · SLAs · Error budgets", "Incident management", "On-call runbooks", "Chaos engineering", "Capacity planning"],
  },
  {
    title: "Cloud & Databases",
    items: ["OCI · AWS multi-cloud", "Oracle Autonomous DB", "CDB/PDB multitenant", "PostgreSQL · RDS · Aurora", "Data Guard · GoldenGate"],
  },
  {
    title: "AI / LLM Engineering",
    items: ["Anthropic Claude API", "RAG · vector embeddings", "Multi-agent orchestration", "LLMOps · cost tracking", "Prompt engineering"],
  },
  {
    title: "Automation & DevOps",
    items: ["Python · Shell · TypeScript", "Kubernetes (CKA) · Docker", "Terraform · Helm", "AWR · ADDM · AppDynamics", "CI/CD pipelines"],
  },
];

export default function Skills() {
  return (
    <section id="skills" className="px-6 py-20 max-w-6xl mx-auto">
      <div className="section-head">
        <div className="eyebrow">skills</div>
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
          Technical expertise
        </h2>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {GROUPS.map((g) => (
          <div key={g.title} className="panel panel-hover p-5">
            <h3 className="font-mono text-xs tracking-wider uppercase text-[var(--teal)] mb-4">
              {g.title}
            </h3>
            <ul className="space-y-2">
              {g.items.map((item) => (
                <li key={item} className="text-sm text-[var(--ink-soft)]">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
