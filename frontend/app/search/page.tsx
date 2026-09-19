"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");

  async function search() {
    setStatus("Searching...");
    const response = await fetch(`${API_URL}/api/search/candidates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    const data = await response.json();
    setStatus(data.results.length ? `${data.results.length} candidates found` : "No candidates indexed yet.");
  }

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm uppercase tracking-[0.25em] text-zinc-500">Semantic search</p>
        <h1 className="mt-3 text-4xl font-bold">Find candidates by meaning</h1>
        <p className="mt-3 text-zinc-400">Describe the experience you need in natural language.</p>
        <div className="mt-10 flex gap-3">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="e.g. Python backend engineer with AWS experience"
            className="flex-1 rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4 outline-none focus:border-zinc-500"
          />
          <button onClick={search} className="rounded-2xl bg-white px-6 font-semibold text-black">Search</button>
        </div>
        {status && <p className="mt-6 text-zinc-400">{status}</p>}
      </div>
    </main>
  );
}
