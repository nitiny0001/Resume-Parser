"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

type SearchResult = {
  id: string;
  filename: string;
  similarity: number;
  profile: {
    name?: string | null;
    headline?: string | null;
    skills?: { name: string }[];
    years_of_experience?: number | null;
  };
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function search(event?: FormEvent) {
    event?.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setStatus("Enter at least 2 characters.");
      return;
    }

    setLoading(true);
    setStatus("");

    try {
      const response = await fetch(API_URL + "/api/search/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail ?? "Search failed.");
      }

      setResults(data.results ?? []);
      setStatus(
        data.status === "embedding-not-configured"
          ? "Semantic search needs an OpenAI API key and embedding configuration."
          : data.results?.length
            ? String(data.results.length) + " candidates found"
            : "No matching candidates found.",
      );
    } catch (error) {
      setResults([]);
      setStatus(error instanceof Error ? error.message : "Search failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm uppercase tracking-[0.25em] text-zinc-500">Semantic search</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">Find candidates by meaning</h1>
        <p className="mt-3 text-zinc-400">Describe the experience you need in natural language.</p>

        <form onSubmit={search} className="mt-10 flex flex-col gap-3 sm:flex-row">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="e.g. Python backend engineer with AWS experience"
            className="flex-1 rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4 outline-none focus:border-zinc-500"
            aria-label="Candidate search query"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-white px-6 py-4 font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {status && <p className="mt-6 text-sm text-zinc-400">{status}</p>}

        <section className="mt-8 space-y-3">
          {results.map((result) => {
            const skills = result.profile.skills?.slice(0, 6) ?? [];
            const name = result.profile.name || result.filename;

            return (
              <Link
                key={result.id}
                href={"/resumes/" + result.id}
                className="block rounded-3xl border border-zinc-800 bg-zinc-950 p-6 transition hover:border-zinc-600 hover:bg-zinc-900/70"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="font-semibold">{name}</h2>
                      <span className="rounded-full border border-zinc-800 px-2.5 py-1 text-xs text-zinc-400">
                        {(result.similarity * 100).toFixed(1)}% match
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-zinc-500">
                      {result.profile.headline || result.filename}
                    </p>
                  </div>
                  {result.profile.years_of_experience != null && (
                    <p className="text-sm text-zinc-400">
                      {result.profile.years_of_experience} yrs experience
                    </p>
                  )}
                </div>

                {skills.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span
                        key={skill.name}
                        className="rounded-full bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            );
          })}
        </section>
      </div>
    </main>
  );
}
