"use client";
import { useState } from "react";

export default function AIDashboard() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runAI = async () => {
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      const text = data.result || "";
      const sections = {
        summary: "",
        points: [] as string[],
        insights: [] as string[],
      };

      let current = "";

      text.split("\n").forEach((line: string) => {
        if (line.toLowerCase().includes("summary")) current = "summary";
        else if (line.toLowerCase().includes("key points")) current = "points";
        else if (line.toLowerCase().includes("insights")) current = "insights";
        else {
          if (current === "summary") sections.summary += line + " ";
          if (current === "points" && line.trim().startsWith("-"))
            sections.points.push(line.replace("-", "").trim());
          if (current === "insights" && line.trim().startsWith("-"))
            sections.insights.push(line.replace("-", "").trim());
        }
      });

      setResponse(sections);
    } catch {
      setResponse(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel p-6 h-full flex flex-col justify-between">
      {/* TOP */}
      <div>
        <div className="eyebrow mb-3">live · groq llm</div>
        <h2 className="text-xl font-medium mb-3">AI Insight Dashboard</h2>

        <p className="text-[var(--ink-soft)] text-sm leading-relaxed min-h-[72px]">
          An AI-powered assistant built on modern LLM APIs — analyzes your
          input and returns structured insights: summary, key points, actions.
        </p>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full p-3 rounded-lg bg-[var(--bg-raise)] border border-[var(--line)] text-[var(--ink)] font-mono text-sm mt-4 focus:border-[var(--teal)] focus:outline-none"
          rows={3}
          placeholder="Ask anything…"
        />
      </div>

      {/* ACTION */}
      <div className="mt-5 flex justify-center">
        <button
          onClick={runAI}
          disabled={loading}
          className="px-6 py-2.5 rounded-lg bg-[var(--teal)] text-[#0B1018] font-medium text-sm hover:bg-[var(--teal-dim)] transition-colors disabled:opacity-50"
        >
          {loading ? "Thinking…" : "Run AI"}
        </button>
      </div>

      {/* OUTPUT */}
      {response && (
        <div className="mt-5 text-left space-y-3">
          <div className="bg-[var(--bg-raise)] border border-[var(--line)] p-3 rounded-lg">
            <p className="font-mono text-[10px] tracking-widest uppercase text-[var(--teal)] mb-1.5">
              Summary
            </p>
            <p className="text-sm text-[var(--ink-soft)]">{response.summary}</p>
          </div>

          <div className="bg-[var(--bg-raise)] border border-[var(--line)] p-3 rounded-lg">
            <p className="font-mono text-[10px] tracking-widest uppercase text-[var(--amber)] mb-1.5">
              Key Points
            </p>
            <ul className="list-disc list-inside text-sm text-[var(--ink-soft)] space-y-1">
              {response.points.map((p: string, i: number) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>

          <div className="bg-[var(--bg-raise)] border border-[var(--line)] p-3 rounded-lg">
            <p className="font-mono text-[10px] tracking-widest uppercase text-[var(--teal)] mb-1.5">
              Insights
            </p>
            <ul className="list-disc list-inside text-sm text-[var(--ink-soft)] space-y-1">
              {response.insights.map((p: string, i: number) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
