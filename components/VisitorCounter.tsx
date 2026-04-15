"use client";
import { useEffect, useState } from "react";

export default function VisitorCounter() {
  const [visits, setVisits] = useState<number | null>(null);

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        const res = await fetch("/api/visits");
        const data = await res.json();
        setVisits(data.visits);
      } catch (err) {
        console.error("Visitor error:", err);
        setVisits(0);
      }
    };

    fetchVisits();
  }, []);

  return (
    <div className="text-center mt-10 text-gray-500 text-sm">
      👀 Visitors: {visits ?? "Loading..."}
    </div>
  );
}