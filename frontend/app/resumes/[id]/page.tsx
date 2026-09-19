"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function ResumePage() {
  const params = useParams<{ id: string }>();
  const [resume, setResume] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/resumes/${params.id}`)
      .then((response) => response.json())
      .then(setResume);
  }, [params.id]);

  if (!resume) return <main className="min-h-screen bg-black p-10 text-zinc-400">Loading resume...</main>;

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm text-zinc-500">{resume.status}</p>
        <h1 className="mt-2 text-4xl font-bold">{resume.filename}</h1>
        <section className="mt-10 rounded-3xl border border-zinc-800 p-6">
          <h2 className="text-xl font-semibold">Extracted profile</h2>
          <pre className="mt-5 overflow-auto text-sm text-zinc-400">
            {JSON.stringify(resume.profile ?? {}, null, 2)}
          </pre>
        </section>
      </div>
    </main>
  );
}
