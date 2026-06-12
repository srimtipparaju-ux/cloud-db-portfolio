"use client";
import { FaLinkedin, FaGithub } from "react-icons/fa";

export default function Contact() {
  const btn =
    "inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--teal)] text-[#0B1018] font-medium text-sm hover:bg-[var(--teal-dim)] transition-colors";

  return (
    <section id="contact" className="px-6 pt-20 pb-10 max-w-6xl mx-auto">
      <div className="section-head" style={{ marginBottom: "1rem" }}>
        <div className="eyebrow">contact</div>
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
          Open to full-time SRE and cloud platform roles
        </h2>
      </div>
      <p className="font-mono text-xs tracking-widest text-[var(--ink-dim)] mb-10 text-center">
        US CITIZEN · NO SPONSORSHIP REQUIRED · NASHVILLE, TN
      </p>

      <div className="flex flex-wrap gap-3 justify-center">
        <a href="mailto:srim.tipparaju@gmail.com" className={btn}>
          srim.tipparaju@gmail.com
        </a>
        <a href="tel:+13378532128" className={btn}>
          (337) 853-2128
        </a>
        <a
          href="https://www.linkedin.com/in/sritipparaju"
          target="_blank"
          rel="noopener noreferrer"
          className={btn}
        >
          <FaLinkedin /> LinkedIn
        </a>
        <a
          href="https://github.com/srimtipparaju-ux"
          target="_blank"
          rel="noopener noreferrer"
          className={btn}
        >
          <FaGithub /> GitHub
        </a>
      </div>
    </section>
  );
}
