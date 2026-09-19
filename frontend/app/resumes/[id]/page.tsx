"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

type SkillCategory =
  | "language"
  | "framework"
  | "library"
  | "database"
  | "tool"
  | "cloud_devops"
  | "ai_ml"
  | "core_skill"
  | "other";

type Evidence = {
  source: string;
  text: string;
  confidence: number;
};

type Skill = {
  name: string;
  category?: SkillCategory;
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

const CATEGORY_META: { key: SkillCategory; label: string; description: string }[] = [
  { key: "language", label: "Languages", description: "Programming and query languages" },
  { key: "framework", label: "Frameworks", description: "Application and UI frameworks" },
  { key: "library", label: "Libraries", description: "Libraries used in projects and analysis" },
  { key: "database", label: "Databases", description: "Data stores and databases" },
  { key: "tool", label: "Developer Tools", description: "Engineering and collaboration tools" },
  { key: "cloud_devops", label: "Cloud & DevOps", description: "Cloud, containers and delivery" },
  { key: "ai_ml", label: "AI & Machine Learning", description: "AI, ML and model-related skills" },
  { key: "core_skill", label: "Relevant Skills", description: "Role-relevant technical capabilities" },
  { key: "other", label: "Other", description: "Additional evidence-backed skills" },
];

const CATEGORY_MAP: Record<string, SkillCategory> = {
  python: "language",
  c: "language",
  java: "language",
  "c++": "language",
  javascript: "language",
  typescript: "language",
  sql: "language",
  react: "framework",
  "next.js": "framework",
  nextjs: "framework",
  fastapi: "framework",
  flask: "framework",
  django: "framework",
  "tailwind css": "framework",
  numpy: "library",
  pandas: "library",
  matplotlib: "library",
  "scikit-learn": "library",
  postgresql: "database",
  mysql: "database",
  mongodb: "database",
  redis: "database",
  docker: "cloud_devops",
  aws: "cloud_devops",
  kubernetes: "cloud_devops",
  git: "tool",
  github: "tool",
  postman: "tool",
  "machine learning": "ai_ml",
  "generative ai": "ai_ml",
  "artificial intelligence": "ai_ml",
  nlp: "ai_ml",
  "deep learning": "ai_ml",
  "data preprocessing": "core_skill",
  "feature engineering": "core_skill",
  "predictive analytics": "core_skill",
  "linear regression": "core_skill",
  "resume parsing": "core_skill",
  "skill-gap analysis": "core_skill",
};

function getCategory(skill: Skill): SkillCategory {
  if (skill.category) return skill.category;
  return CATEGORY_MAP[skill.name.toLowerCase()] ?? "other";
}

function formatExperience(years: number | null | undefined) {
  if (years == null) return null;
  if (years > 0 && years < 1) return "<1 year experience";
  return years === 1 ? "1 year experience" : years + " years experience";
}

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

  const groupedSkills = useMemo(() => {
    const groups = new Map<SkillCategory, Skill[]>();
    for (const skill of skills) {
      const category = getCategory(skill);
      const current = groups.get(category) ?? [];
      current.push(skill);
      groups.set(category, current);
    }
    return groups;
  }, [skills]);

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
              {formatExperience(profile.years_of_experience) && (
                <span className="text-sm text-zinc-500">{formatExperience(profile.years_of_experience)}</span>
              )}
            </div>
            <h1 className="mt-4 text-4xl font-bold tracking-tight">
              {profile.name || resume.filename}
            </h1>
            <p className="mt-2 max-w-3xl text-zinc-500">
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
            <div>
              <h2 className="text-lg font-semibold">Candidate profile</h2>
              {profile.summary ? (
                <p className="mt-5 text-[15px] leading-7 text-zinc-300">{profile.summary}</p>
              ) : (
                <p className="mt-5 text-sm text-zinc-600">
                  {active ? "Waiting for structured profile extraction..." : "No summary was extracted."}
                </p>
              )}
            </div>

            <div className="mt-10">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h3 className="font-medium">Technical profile</h3>
                  <p className="mt-1 text-sm text-zinc-600">
                    Technologies are grouped by how they are used, with evidence preserved.
                  </p>
                </div>
                <span className="text-xs text-zinc-600">{skills.length} skills indexed</span>
              </div>

              {skills.length === 0 ? (
                <p className="mt-6 text-sm text-zinc-600">
                  {active ? "Skills will appear after analysis completes." : "No skills were extracted."}
                </p>
              ) : (
                <div className="mt-6 space-y-8">
                  {CATEGORY_META.map((category) => {
                    const categorySkills = groupedSkills.get(category.key);
                    if (!categorySkills?.length) return null;

                    return (
                      <section key={category.key}>
                        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                          <div>
                            <h4 className="font-semibold">{category.label}</h4>
                            <p className="mt-1 text-xs text-zinc-600">{category.description}</p>
                          </div>
                          <span className="text-xs text-zinc-700">{categorySkills.length}</span>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          {categorySkills.map((skill) => (
                            <details key={skill.name} className="group rounded-2xl border border-zinc-800 bg-black/40 p-4">
                              <summary className="cursor-pointer list-none">
                                <div className="flex items-center justify-between gap-3">
                                  <span className="font-medium text-zinc-200">{skill.name}</span>
                                  <span className="text-xs text-zinc-600">
                                    {(skill.confidence * 100).toFixed(0)}%
                                  </span>
                                </div>
                                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-900">
                                  <div
                                    className="h-full rounded-full bg-zinc-400"
                                    style={{ width: String(Math.round(skill.confidence * 100)) + "%" }}
                                  />
                                </div>
                              </summary>

                              <div className="mt-4 space-y-2 border-t border-zinc-900 pt-4">
                                {skill.evidence.map((evidence, index) => (
                                  <div key={skill.name + "-" + index} className="rounded-xl bg-zinc-950 p-3">
                                    <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-600">
                                      {evidence.source}
                                    </p>
                                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                                      “{evidence.text}”
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </details>
                          ))}
                        </div>
                      </section>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-7">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-600">Profile snapshot</p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-black p-4">
                  <p className="text-2xl font-semibold">{skills.length}</p>
                  <p className="mt-1 text-xs text-zinc-600">Indexed skills</p>
                </div>
                <div className="rounded-2xl bg-black p-4">
                  <p className="text-2xl font-semibold">{groupedSkills.size}</p>
                  <p className="mt-1 text-xs text-zinc-600">Skill groups</p>
                </div>
              </div>
              <div className="mt-5 border-t border-zinc-900 pt-5">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-600">Document</p>
                <h2 className="mt-3 break-words font-semibold">{resume.filename}</h2>
                <p className="mt-2 text-sm text-zinc-500">{resume.content_type}</p>
                {resume.created_at && (
                  <p className="mt-5 text-xs text-zinc-600">
                    Uploaded {new Date(resume.created_at).toLocaleString()}
                  </p>
                )}
              </div>
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
