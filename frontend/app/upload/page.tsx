"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleUpload() {
    if (!file) return;
    setLoading(true);
    setMessage("");

    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch(`${API_URL}/api/resumes/upload`, { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail ?? "Upload failed");
      router.push(`/resumes/${data.id}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm uppercase tracking-[0.25em] text-zinc-500">Pipeline / 01</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight">Upload your resume</h1>
        <p className="mt-3 text-zinc-400">PDF or DOCX, up to 10MB. We extract text first, then enrich it asynchronously.</p>

        <label className="mt-10 flex min-h-80 cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-700 bg-zinc-950 p-10 text-center transition hover:border-zinc-400">
          <input type="file" accept=".pdf,.docx" className="hidden" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
          <div className="text-5xl text-zinc-300">↑</div>
          <h2 className="mt-5 text-xl font-semibold">Choose a resume</h2>
          <p className="mt-2 text-sm text-zinc-500">PDF or DOCX files only</p>
          {file && <div className="mt-6 max-w-full truncate rounded-xl bg-zinc-900 px-5 py-3 text-sm">{file.name}</div>}
        </label>

        <button onClick={handleUpload} disabled={!file || loading} className="mt-6 w-full rounded-2xl bg-white px-6 py-4 font-semibold text-black disabled:cursor-not-allowed disabled:opacity-40">
          {loading ? "Uploading and queueing..." : "Analyze Resume"}
        </button>

        {message && <p className="mt-5 text-sm text-red-300">{message}</p>}
      </div>
    </main>
  );
}
