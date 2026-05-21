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
    <main className="bg-black text-white">
      <Navbar />
      <Hero />
      <Certifications />
      <About />
      <Architecture />
      <Projects />

      {/* ── OpsMind Architecture Flow GIF ─────────────────────── */}
      <section className="px-6 py-12 border-t border-white/5">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="text-center">
            <div className="text-xs font-mono text-green-400 tracking-widest uppercase mb-2">
              Architecture
            </div>
            <h2 className="text-2xl font-bold">How OpsMind works</h2>
            <p className="text-white/60 text-sm mt-3 max-w-2xl mx-auto leading-relaxed">
              Diagnostic artifacts flow through the API gateway, get classified and analyzed by
              5 specialized agents in parallel. RAG retrieves runbooks. Findings route to Slack,
              Jira, and email automatically.
            </p>
          </div>
          <div className="rounded-lg overflow-hidden border border-white/10 bg-black">
            <img
              src="/perfagent/perfagent_architecture_flow.gif"
              alt="OpsMind AI SRE Copilot — architecture flow diagram"
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* ── PerfAgent Live Demo ──────────────────────────────── */}
      <section className="px-6 py-16 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="text-xs font-mono text-green-400 tracking-widest uppercase">
            Featured Project — Live Demo
          </div>
          <h2 className="text-3xl font-bold">PerfAgent</h2>
          <p className="text-white/60 text-sm leading-relaxed max-w-xl mx-auto">
            AI-powered performance diagnostic platform. Analyzes Oracle AWR, thread dumps,
            heap dumps, JFR, SQL, browser logs, and JMeter results — simultaneously.
            Now with RAG over runbooks and a conversational chat interface.
          </p>
          <div className="flex justify-center pt-2">
            <PerfAgentButton />
          </div>
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-10 px-6 items-stretch">
        <AIDashboard />
        <Demo />
      </div>
      <Skills />
      <Contact />
      <VisitorCounter />
    </main>
  );
}
