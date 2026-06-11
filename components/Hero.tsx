"use client";
import { motion } from "framer-motion";

const STATS = [
  { value: "13+", label: "years in production" },
  { value: "99.9%", label: "platform availability" },
  { value: "40%", label: "MTTR reduction" },
  { value: "200+", label: "databases kept healthy" },
];

const CONSOLE_LINES = [
  { t: "08:00:12", tag: "INFO",  tagColor: "var(--teal)",  text: "5 diagnostic artifacts ingested" },
  { t: "08:00:14", tag: "SKILL", tagColor: "var(--teal)",  text: "awr · thread-dump · heap · sql · k8s" },
  { t: "08:00:19", tag: "RAG",   tagColor: "var(--amber)", text: "retrieved 3 runbooks (deadlock, OOM, pool)" },
  { t: "08:00:41", tag: "ROOT",  tagColor: "#ff5064",      text: "unbounded cache → OOM → pool exhaustion" },
  { t: "08:00:43", tag: "ROUTE", tagColor: "var(--teal)",  text: "Slack #incidents · Jira BACKEND-2841" },
  { t: "08:00:43", tag: "DONE",  tagColor: "var(--teal)",  text: "triage complete in 31s · $0.10" },
];

export default function Hero() {
  return (
    <section className="px-6 pt-32 pb-20 max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-12 items-center mb-14">
        {/* Left — identity */}
        <div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-wrap items-center gap-3 mb-7 font-mono text-xs tracking-widest text-[var(--ink-soft)]"
          >
            <span className="status-dot" />
            <span className="text-[var(--teal)]">OPERATIONAL</span>
            <span className="text-[var(--ink-dim)]">·</span>
            <span>SRE / CLOUD / AI TOOLING</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05] mb-6"
          >
            Sri Manaswi <span className="text-[var(--teal)]">Tipparaju</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="text-lg text-[var(--ink-soft)] leading-relaxed mb-8"
          >
            Site Reliability Engineer — 13 years inside Oracle and Cisco keeping
            mission-critical platforms alive, now building the AI tooling that
            diagnoses production incidents autonomously.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-3"
          >
            <a
              href="#projects"
              className="px-6 py-3 rounded-lg bg-[var(--teal)] text-[#0B1018] font-medium text-sm hover:bg-[var(--teal-dim)] transition-colors"
            >
              View work
            </a>
            <a
              href="/Sri_Tipparaju_SRE_Resume.pdf"
              download
              className="px-6 py-3 rounded-lg border border-[var(--line)] text-sm hover:border-[var(--teal)] hover:text-[var(--teal)] transition-colors"
            >
              Resume (PDF)
            </a>
            <a
              href="https://github.com/srimtipparaju-ux"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-lg border border-[var(--line)] text-sm hover:border-[var(--teal)] hover:text-[var(--teal)] transition-colors"
            >
              GitHub
            </a>
          </motion.div>
        </div>

        {/* Right — live triage console (fills the empty half) */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="panel overflow-hidden hidden lg:block"
        >
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--line-soft)] bg-[var(--bg-raise)]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5064] opacity-70" />
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--amber)] opacity-70" />
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--teal)] opacity-70" />
            <span className="ml-3 font-mono text-[11px] text-[var(--ink-dim)] tracking-wider">
              opsmind — incident triage
            </span>
          </div>
          <div className="p-5 space-y-2.5 font-mono text-[12px] leading-relaxed">
            {CONSOLE_LINES.map((l, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.18 }}
                className="flex gap-3"
              >
                <span className="text-[var(--ink-dim)]">{l.t}</span>
                <span style={{ color: l.tagColor }} className="w-12 flex-shrink-0">
                  {l.tag}
                </span>
                <span className="text-[var(--ink-soft)]">{l.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Telemetry strip — full width */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[var(--line)] rounded-xl overflow-hidden border border-[var(--line)]"
      >
        {STATS.map((s) => (
          <div key={s.label} className="bg-[var(--surface)] px-5 py-5 text-center">
            <div className="font-mono text-2xl text-[var(--teal)]">{s.value}</div>
            <div className="text-xs text-[var(--ink-dim)] mt-1">{s.label}</div>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
