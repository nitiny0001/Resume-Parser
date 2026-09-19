"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

type Evidence = {
  source: string;
  text: string;
  confidence: number;
};

type Skill = {
  name: string;
  confidence: number;
  evidence: Evidence[];
};

type Profile = {
  name?: string | null;
  headline?: string | null;
  summary?: string | null;
  skills?: Skill[];
  years_of_experience?: number | null;
};

type Resume = {
  id: string;
  filename: string;
  content_type: string;
  status: string;
  profile: Profile;
  extracted_text?: string | null;
  created_at?: string | null;
};

const ACTIVE_STATUSES = new Set(["queued", "processing"]);

export default function ResumePage() {
  const params = useParams<{ id: string }>();
  const [resume, setResume] = useState<Resume | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function loadResume() {
      try {
        const response = await fetch(API_URL + "/api/resumes/" + params.id, {
          cache: "no-store",
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail ?? "Could not load resume.");
        }

        if (cancelled) return;
        setResume(data);
        setError("");

        if (ACTIVE_STATUSES.has(data.status)) {
          timer = setTimeout(loadResume, 2500);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Could not load resume.");
        }
      }
    }

    loadResume();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [params.id]);

  if (error) {
    return (
      <main className="min-h-screen bg-black px-6 py-16 text-white">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm text-red-300">{error}</p>
          <Link href="/dashboard" className="mt-5 inline-block text-sm text-zinc-400 hover:text-white">
            ← Back to dashboard
          </Link>
        </div>
      </main>
    );
  }

  if (!resume) {
    return (
      <main className="min-h-screen bg-black p-10 text-zinc-400">
        Loading resume...
      </main>
    );
  }

  const profile = resume.profile ?? {};
  const skills = profile.skills ?? [];
  const active = ACTIVE_STATUSES.has(resume.status);

  return (
    <main className="min-h-screen bg-black px-6 py-14 text-white">
      <div className="mx-auto max-w-6xl">
        <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-white">
          ← Dashboard
        </Link>

        <div className="mt-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-zinc-800 px-3 py-1 text-xs uppercase tracking-[0.15em] text-zinc-400">
                {resume.status}
              </span>
              {profile.years_of_experience != null && (
                <span className="text-sm text-zinc-500">
                  {profile.years_of_experience} years experience
                </span>
              )}
            </div>
            <h1 className="mt-4 text-4xl font-bold tracking-tight">
              {profile.name || resume.filename}
            </h1>
            <p className="mt-2 text-zinc-500">
              {profile.headline || resume.filename}
            </p>
          </div>

          {active && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4 text-sm text-zinc-400">
              Analysis is still running. This page will update automatically.
            </div>
          )}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-7">
            <h2 className="text-lg font-semibold">Candidate profile</h2>

            {profile.summary ? (
              <p className="mt-5 text-[15px] leading-7 text-zinc-300">{profile.summary}</p>
            ) : (
              <p className="mt-5 text-sm text-zinc-600">
                {active ? "Waiting for structured profile extraction..." : "No summary was extracted."}
              </p>
            )}

            <div className="mt-8">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Skills & evidence</h3>
                <span className="text-xs text-zinc-600">{skills.length} indexed</span>
              </div>

              {skills.length === 0 ? (
                <p className="mt-5 text-sm text-zinc-600">
                  {active ? "Skills will appear after analysis completes." : "No skills were extracted."}
                </p>
              ) : (
                <div className="mt-5 space-y-4">
                  {skills.map((skill) => (
                    <article key={skill.name} className="rounded-2xl border border-zinc-800 p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h4 className="font-medium">{skill.name}</h4>
                        <span className="text-xs text-zinc-500">
                          {(skill.confidence * 100).toFixed(0)}% confidence
                        </span>
                      </div>

                      <div className="mt-4 space-y-2">
                        {skill.evidence.map((evidence, index) => (
                          <div key={skill.name + "-" + index} className="rounded-xl bg-black p-4">
                            <p className="text-xs uppercase tracking-[0.15em] text-zinc-600">
                              {evidence.source}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-zinc-400">
                              “{evidence.text}”
                            </p>
                          </div>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-7">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-600">Document</p>
              <h2 className="mt-3 break-words font-semibold">{resume.filename}</h2>
              <p className="mt-2 text-sm text-zinc-500">{resume.content_type}</p>
              {resume.created_at && (
                <p className="mt-5 text-xs text-zinc-600">
                  Uploaded {new Date(resume.created_at).toLocaleString()}
                </p>
              )}
            </section>

            <details className="rounded-3xl border border-zinc-800 bg-zinc-950 p-7">
              <summary className="cursor-pointer text-sm font-medium text-zinc-300">
                View extracted text
              </summary>
              <pre className="mt-5 max-h-[35rem] overflow-auto whitespace-pre-wrap text-xs leading-6 text-zinc-500">
                {resume.extracted_text || "No extracted text available."}
              </pre>
            </details>
          </aside>
        </div>
      </div>
    </main>
  );
}
