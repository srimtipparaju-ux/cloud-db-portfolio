"use client";
import { motion } from "framer-motion";

const LINKS = [
  { href: "#projects", label: "Work" },
  { href: "#architecture", label: "Stack" },
  { href: "#skills", label: "Skills" },
  { href: "#contact", label: "Contact" },
];

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -64 }}
      animate={{ y: 0 }}
      className="fixed top-0 w-full z-50 border-b border-[var(--line-soft)] bg-[rgba(11,16,24,0.82)] backdrop-blur-md"
    >
      <div className="max-w-6xl mx-auto flex justify-between items-center px-6 h-14">
        <a href="#" className="font-mono text-sm tracking-wider text-[var(--ink)]">
          <span className="text-[var(--teal)]">~/</span>sri-tipparaju
        </a>

        <div className="flex items-center gap-6 text-sm text-[var(--ink-soft)]">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-[var(--teal)] transition-colors">
              {l.label}
            </a>
          ))}
          <a
            href="https://github.com/srimtipparaju-ux"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs border border-[var(--line)] rounded px-3 py-1.5 hover:border-[var(--teal)] hover:text-[var(--teal)] transition-colors"
          >
            GitHub ↗
          </a>
        </div>
      </div>
    </motion.nav>
  );
}
