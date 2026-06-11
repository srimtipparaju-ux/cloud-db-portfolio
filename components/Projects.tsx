"use client";
import { motion } from "framer-motion";

type ProjectLink = {
  label: string;
  href: string;
};

type Project = {
  title: string;
  desc: string;
  tags: string[];
  links?: ProjectLink[];
  featured?: boolean;
};

const projects: Project[] = [
  {
    title: "OpsMind — AI SRE Copilot Platform",
    desc: "Autonomous AI platform that triages production incidents in 30 seconds across 10 diagnostic domains (Oracle AWR, JVM, SQL, frontend, Kubernetes). Multi-agent architecture with RAG over runbooks, conversational chat, and LLMOps observability. 5,000x cost reduction vs manual triage.",
    tags: ["TypeScript", "Anthropic Claude", "Pinecone", "Prometheus", "AWS ECS"],
    featured: true,
    links: [
      { label: "Production repo", href: "https://github.com/srimtipparaju-ux/perfagent" },
      { label: "Demo repo", href: "https://github.com/srimtipparaju-ux/perfagent-demo" },
      { label: "Claude skills", href: "https://github.com/srimtipparaju-ux/claude-skills" },
      { label: "Live demo", href: "#perfagent-demo" },
    ],
  },
  {
    title: "OCI Cloud Database Platform",
    desc: "Designed and managed large-scale Oracle Autonomous Database and multitenant environments on OCI, supporting cloud management applications with high availability and scalability.",
    tags: ["OCI", "Autonomous DB", "CDB/PDB"],
  },
  {
    title: "SQL Performance Optimization Framework",
    desc: "Led cross-team initiatives to analyze and tune complex SQL and PL/SQL workloads using AWR, ADDM, and SQL Monitor — improving query throughput 60%+ on the highest-traffic workloads.",
    tags: ["AWR", "ADDM", "SQL Monitor"],
  },
  {
    title: "Enterprise Database Migration",
    desc: "Executed cross-platform migration for a Fortune 10 customer, moving Oracle Enterprise Manager from Solaris to Linux with zero data loss and no production impact.",
    tags: ["Data Pump", "Zero downtime"],
  },
  {
    title: "Automation & Deployment Pipelines",
    desc: "Automated database provisioning in OCI using Python and shell — a manual 4–6 hour process brought down to under 30 minutes with environment parity across dev, staging, and prod.",
    tags: ["Python", "Shell", "CI/CD"],
  },
];

export default function Projects() {
  return (
    <section id="projects" className="px-6 py-20 max-w-6xl mx-auto">
      <div className="section-head">
        <div className="eyebrow">work</div>
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
          Key engineering work
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {projects.map((project, index) => (
          <motion.article
            key={project.title}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: index * 0.06, duration: 0.4 }}
            className={`panel panel-hover relative p-6 border-l-2 ${
              project.featured
                ? "md:col-span-2 border-l-[var(--teal)]"
                : "border-l-[var(--line)]"
            }`}
          >
            {project.featured && (
              <span className="absolute top-5 right-5 font-mono text-[10px] tracking-widest text-[var(--amber)] border border-[rgba(251,191,36,0.35)] rounded px-2 py-0.5">
                FEATURED
              </span>
            )}

            <h3 className="text-lg font-medium text-[var(--ink)] pr-24">
              {project.title}
            </h3>
            <p className="text-sm text-[var(--ink-soft)] leading-relaxed mt-3">
              {project.desc}
            </p>

            <div className="flex flex-wrap gap-2 mt-4">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-[11px] text-[var(--ink-dim)] bg-[var(--bg-raise)] rounded px-2 py-1"
                >
                  {tag}
                </span>
              ))}
            </div>

            {project.links && (
              <div className="flex flex-wrap gap-2 mt-5">
                {project.links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="px-3 py-1.5 text-xs font-mono border border-[rgba(94,234,212,0.35)] text-[var(--teal)] rounded hover:bg-[rgba(94,234,212,0.08)] transition-colors"
                  >
                    {link.label} →
                  </a>
                ))}
              </div>
            )}
          </motion.article>
        ))}
      </div>
    </section>
  );
}
