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

      // 🔥 PARSE RESPONSE
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
  <section className="p-6 text-center h-full">
    <div className="bg-gray-900 p-6 rounded-xl h-full flex flex-col justify-between">

      {/* TOP */}
      <div>
        <h2 className="text-3xl mb-4">AI Insight Dashboard</h2>

        <p className="text-gray-500 mt-6 text-sm max-w-xl mx-auto min-h-[72px]">
          This demo showcases an AI-powered assistant built using modern LLM APIs,
          capable of analyzing user input and generating structured insights.
        </p>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full p-3 rounded bg-black text-green-400 mt-6"
          rows={3}
          placeholder="Ask anything..."
        />
      </div>

      {/* 🔥 STICKY BUTTON */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={runAI}
          className="bg-green-500 px-6 py-2 rounded hover:scale-105 transition"
        >
          {loading ? "Thinking..." : "Run AI"}
        </button>
      </div>

      {/* OUTPUT */}
      {response && (
        <div className="mt-6 text-left space-y-4">
          <div className="bg-black p-3 rounded">
            <p className="text-green-400 mb-1">Summary</p>
            <p className="text-gray-300">{response.summary}</p>
          </div>

          <div className="bg-black p-3 rounded">
            <p className="text-blue-400 mb-1">Key Points</p>
            <ul className="list-disc list-inside text-gray-300">
              {response.points.map((p: string, i: number) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>

          <div className="bg-black p-3 rounded">
            <p className="text-purple-400 mb-1">Insights</p>
            <ul className="list-disc list-inside text-gray-300">
              {response.insights.map((p: string, i: number) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  </section>
);
}