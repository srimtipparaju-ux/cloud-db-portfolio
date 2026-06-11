export default function About() {
  return (
    <section className="px-6 py-20 max-w-6xl mx-auto">
      <div className="section-head">
        <div className="eyebrow">about</div>
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
          The data always tells the story. I read it fast.
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-8 text-[var(--ink-soft)] leading-relaxed">
        <p>
          13 years embedded inside Oracle and Cisco engineering — diagnosing
          production incidents, building the tooling that prevents recurrence,
          and running reliability programs across 20+ teams at scale.
        </p>
        <p>
          At Oracle, I owned SLO/SLA targets on OCI-hosted cloud platforms:
          automated provisioning pipelines, observability builds, and the
          blameless post-mortem culture that actually reduces repeat incidents.
        </p>
        <p>
          Recent work extends into AI — OpsMind is an autonomous SRE copilot
          that triages incidents across Oracle, JVM, frontend, and Kubernetes
          artifacts in 30 seconds, with RAG over runbooks and full LLMOps
          observability.
        </p>
      </div>
    </section>
  );
}
