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
    }, 800); // simulate latency
  };

  return (
    <section className="p-10 text-center">
      <h2 className="text-3xl mb-4">Cloud Database Demo</h2>

      <p className="text-gray-500 mt-6 text-sm max-w-xl mx-auto">
  This demo simulates a cloud-native database API built using Next.js,
  representing how backend services interact with Oracle Autonomous
  Database in OCI environments.
</p>

      {/* Query Input */}
      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full max-w-xl p-3 rounded bg-gray-900 text-green-400 mb-4"
        rows={3}
      />

      {/* Button */}
      <button
        onClick={runQuery}
        className="bg-green-500 px-6 py-2 rounded hover:scale-105 transition"
      >
        Run Query
      </button>

      {/* Loading */}
      {loading && (
        <p className="mt-4 text-yellow-400">Executing query...</p>
      )}

      {/* Output */}
      {data && (
        <div className="mt-6 bg-gray-900 p-4 rounded max-w-xl mx-auto text-left">
          <p className="text-green-400 mb-2">Query Result:</p>
          <pre className="text-gray-300">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </section>
  );
}