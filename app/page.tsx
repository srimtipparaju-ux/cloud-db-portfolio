import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
import Contact from "@/components/Contact";
import Demo from "@/components/Demo";
import Architecture from "@/components/Architecture";
import Certifications from "@/components/Certifications";
import AIDashboard from "@/components/AIDashboard";
import VisitorCounter from "@/components/VisitorCounter";
import PerfAgentButton from "@/components/PerfAgentButton";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Certifications />
      <About />
      <Projects />

      {/* ── OpsMind Architecture Flow ─────────────────────────── */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="section-head" style={{ marginBottom: "1rem" }}>
          <div className="eyebrow">architecture</div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            How OpsMind works
          </h2>
        </div>
        <p className="text-[var(--ink-soft)] text-sm max-w-2xl mx-auto text-center mb-8 leading-relaxed">
          Diagnostic artifacts flow through the API gateway, get classified and
          analyzed by 5 specialized agents in parallel. RAG retrieves runbooks.
          Findings route to Slack, Jira, and email automatically.
        </p>
        <div className="panel overflow-hidden">
          <img
            src="/perfagent/perfagent_architecture_flow.gif"
            alt="OpsMind AI SRE Copilot — animated architecture flow diagram"
            className="w-full h-auto"
          />
        </div>
      </section>

      {/* ── Live Demo ─────────────────────────────────────────── */}
      <section id="perfagent-demo" className="px-6 py-20 max-w-6xl mx-auto">
        <div className="panel p-8 md:p-12 text-center border-l-2 border-l-[var(--teal)]">
          <div className="eyebrow justify-center mb-4">live demo</div>
          <h2 className="text-3xl font-semibold tracking-tight mb-3">OpsMind in action</h2>
          <p className="text-[var(--ink-soft)] text-sm leading-relaxed max-w-xl mx-auto mb-8">
            Analyze real diagnostic samples — Oracle AWR, thread dumps, heap dumps,
            Kubernetes pod failures — and watch the AI build a unified incident
            timeline with RAG-retrieved runbooks and conversational follow-up.
          </p>
          <div className="flex justify-center">
            <PerfAgentButton />
          </div>
        </div>
      </section>

      <Architecture />

      <div className="px-6 py-4 max-w-6xl mx-auto grid md:grid-cols-2 gap-6 items-stretch">
        <AIDashboard />
        <Demo />
      </div>

      <Skills />
      <Contact />

      <footer className="border-t border-[var(--line-soft)]">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-mono text-[11px] text-[var(--ink-dim)]">
          <span>built with Next.js · deployed on Vercel</span>
          <span>·</span>
          <VisitorCounter />
        </div>
      </footer>
    </main>
  );
}
