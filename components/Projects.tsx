"use client";
import { motion } from "framer-motion";

type Link = {
  label: string;
  href: string;
};

type Project = {
  title: string;
  desc: string;
  links?: Link[];
};

export default function Projects() {
  const projects: Project[] = [
    {
      title: "OpsMind — AI SRE Copilot Platform",
      desc: "Autonomous AI platform that triages production incidents in 30 seconds across 10 diagnostic domains (Oracle AWR, JVM, SQL, frontend, Kubernetes). Multi-agent architecture with RAG over runbooks, conversational chat, and LLMOps observability. 5,000x cost reduction vs manual triage.",
      links: [
        { label: "Production Repo", href: "https://github.com/srimtipparaju-ux/perfagent" },
        { label: "Demo Repo",       href: "https://github.com/srimtipparaju-ux/perfagent-demo" },
        { label: "Claude Skills",   href: "https://github.com/srimtipparaju-ux/claude-skills" },
        { label: "Live Demo",       href: "#perfagent-demo" }
      ]
    },
    {
      title: "OCI Cloud Database Platform",
      desc: "Designed and managed large-scale Oracle Autonomous Database and multitenant environments on OCI, supporting cloud management applications with high availability and scalability."
    },
    {
      title: "SQL Performance Optimization Framework",
      desc: "Led cross-team initiatives to analyze and tune complex SQL and PL/SQL workloads using AWR, ADDM, and SQL Monitor, improving query performance and reducing system latency."
    },
    {
      title: "Enterprise Database Migration",
      desc: "Executed cross-platform database migration for a Fortune 10 customer, moving Oracle Enterprise Manager infrastructure from Solaris to Linux using Data Pump and optimized strategies."
    },
    {
      title: "Automation & Deployment Pipelines",
      desc: "Built automated database provisioning and deployment pipelines in OCI using Python and shell scripting, reducing manual effort and accelerating environment setup across teams."
    }
  ];

  return (
    <section id="projects" className="p-10 max-w-6xl mx-auto">
      <h2 className="text-3xl mb-6">Key Engineering Work</h2>

      <div className="grid md:grid-cols-2 gap-6">
        {projects.map((project, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative p-6 rounded-xl bg-gray-900 border ${
              index === 0
                ? "border-green-400/50 shadow-lg shadow-green-400/10"
                : "border-gray-800"
            }`}
          >
            {index === 0 && (
              <span className="absolute -top-2 -right-2 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-green-400 text-black rounded">
                Featured
              </span>
            )}
            <h3 className="text-xl text-green-400">{project.title}</h3>
            <p className="text-gray-300 mt-2">{project.desc}</p>

            {project.links && (
              <div className="mt-4 flex flex-wrap gap-2">
                {project.links.map((link, i) => (
                  <a
                    key={i}
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="px-3 py-1 text-xs font-mono border border-green-400/40 text-green-400 rounded hover:bg-green-400/10 hover:border-green-400 transition-colors"
                  >
                    {link.label} →
                  </a>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}