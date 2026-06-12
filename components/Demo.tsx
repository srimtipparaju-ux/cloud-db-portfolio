"use client";
import { useState } from "react";

export default function Demo() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("SELECT * FROM users;");

  const runQuery = async () => {
    setLoading(true);
    setData(null);

    const res = await fetch("/api/demo");
    const result = await res.json();

    setTimeout(() => {
      setData(result);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="panel p-6 h-full flex flex-col justify-between">
      {/* TOP */}
      <div>
        <div className="eyebrow mb-3">live · oci pattern</div>
        <h2 className="text-xl font-medium mb-3">Cloud Database Demo</h2>

        <p className="text-[var(--ink-soft)] text-sm leading-relaxed min-h-[72px]">
          A cloud-native database API built with Next.js — the same pattern
          backend services use to interact with Oracle Autonomous Database
          in OCI environments.
        </p>

        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full p-3 rounded-lg bg-[var(--bg-raise)] border border-[var(--line)] text-[var(--ink)] font-mono text-sm mt-4 focus:border-[var(--teal)] focus:outline-none"
          rows={3}
        />
      </div>

      {/* ACTION */}
      <div className="mt-5 flex justify-center">
        <button
          onClick={runQuery}
          disabled={loading}
          className="px-6 py-2.5 rounded-lg bg-[var(--teal)] text-[#0B1018] font-medium text-sm hover:bg-[var(--teal-dim)] transition-colors disabled:opacity-50"
        >
          {loading ? "Running…" : "Run Query"}
        </button>
      </div>

      {/* OUTPUT */}
      {data && (
        <div className="mt-5 bg-[var(--bg-raise)] border border-[var(--line)] p-4 rounded-lg text-left">
          <p className="font-mono text-[10px] tracking-widest uppercase text-[var(--teal)] mb-2">
            Query Result
          </p>
          <pre className="text-sm text-[var(--ink-soft)] overflow-x-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
