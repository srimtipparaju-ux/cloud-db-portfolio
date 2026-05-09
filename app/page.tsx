import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
import Contact from "@/components/Contact";
import Demo from "@/components/Demo";
import Architecture from "@/components/Architecture";
import Certifications from "@/components/Certifications";

// ✅ NEW IMPORTS
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

      {/* ── PerfAgent Live Demo ───────────────────────────────── */}
      <section className="px-6 py-16 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="text-xs font-mono text-green-400 tracking-widest uppercase">
            Featured Project — Live Demo
          </div>
          <h2 className="text-3xl font-bold">PerfAgent</h2>
          <p className="text-white/60 text-sm leading-relaxed max-w-xl mx-auto">
            AI-powered performance diagnostic platform. Analyzes Oracle AWR reports,
            Java thread dumps, heap dumps, JFR recordings, SQL execution plans,
            browser console logs, and JMeter results — simultaneously.
            Routes findings to the right team via Slack, Jira, and email automatically.
          </p>
          <div className="flex justify-center pt-2">
            <PerfAgentButton />
          </div>
        </div>
      </section>
      {/* ─────────────────────────────────────────────────────── */}

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
