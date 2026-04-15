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
  <section className="p-6 text-center h-full">
    <div className="bg-gray-900 p-6 rounded-xl h-full flex flex-col justify-between">

      {/* TOP CONTENT */}
      <div>
        <h2 className="text-3xl mb-4">Cloud Database Demo</h2>

        <p className="text-gray-500 mt-6 text-sm max-w-xl mx-auto min-h-[72px]">
          This demo simulates a cloud-native database API built using Next.js,
          representing how backend services interact with Oracle Autonomous
          Database in OCI environments.
        </p>

        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full p-3 rounded bg-black text-green-400 mt-6"
          rows={3}
        />
      </div>

      {/* 🔥 STICKY BUTTON */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={runQuery}
          className="bg-green-500 px-6 py-2 rounded hover:scale-105 transition"
        >
          Run Query
        </button>
      </div>

      {/* OUTPUT */}
      {data && (
        <div className="mt-6 bg-black p-4 rounded text-left">
          <p className="text-green-400 mb-2">Query Result:</p>
          <pre className="text-gray-300">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  </section>
);
}