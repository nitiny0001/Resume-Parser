"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

type Resume = {
  id: string;
  filename: string;
  status: string;
  profile: { name?: string; skills?: { name: string }[] };
  created_at: string | null;
};

export default function DashboardPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API_URL + "/api/resumes")
      .then((response) => response.json())
      .then(setResumes)
      .catch(() => setResumes([]))
      .finally(() => setLoading(false));
  }, []);

  const skills = useMemo(
    () => new Set(resumes.flatMap((resume) => resume.profile.skills ?? []).map((skill) => skill.name)).size,
    [resumes],
  );

  const stats = [
    ["Resumes", String(resumes.length)],
    ["Skills indexed", String(skills)],
    ["Processed", String(resumes.filter((resume) => resume.status === "processed").length)],
    ["Processing", String(resumes.filter((resume) => ["queued", "processing"].includes(resume.status)).length)],
  ];

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-zinc-500">Workspace</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight">Candidate intelligence</h1>
            <p className="mt-3 text-zinc-400">Evidence-backed resume extraction and semantic discovery.</p>
          </div>
          <Link href="/upload" className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black">Upload resume</Link>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {stats.map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <p className="text-sm text-zinc-500">{label}</p>
              <p className="mt-3 text-3xl font-semibold">{value}</p>
            </div>
          ))}
        </div>

        <section className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-950/70">
          <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-5">
            <div>
              <h2 className="font-semibold">Recent resumes</h2>
              <p className="mt-1 text-sm text-zinc-500">Latest documents entering the intelligence pipeline.</p>
            </div>
            <Link href="/search" className="text-sm text-zinc-300 hover:text-white">Semantic search →</Link>
          </div>

          {loading ? (
            <p className="px-6 py-10 text-sm text-zinc-500">Loading workspace...</p>
          ) : resumes.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <p className="text-zinc-300">No resumes yet.</p>
              <Link href="/upload" className="mt-3 inline-block text-sm text-zinc-500 hover:text-white">Upload your first resume →</Link>
            </div>
          ) : (
            <div className="divide-y divide-zinc-900">
              {resumes.slice(0, 10).map((resume) => (
                <Link key={resume.id} href={"/resumes/" + resume.id} className="flex items-center justify-between gap-4 px-6 py-5 hover:bg-zinc-900/60">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{resume.profile.name || resume.filename}</p>
                    <p className="mt-1 truncate text-sm text-zinc-500">{resume.filename}</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-400">{resume.status}</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
