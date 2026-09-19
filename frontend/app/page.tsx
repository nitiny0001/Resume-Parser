import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 text-center">
        <p className="mb-6 text-sm uppercase tracking-[0.3em] text-zinc-500">
          Resume Intelligence Platform
        </p>
        <h1 className="max-w-4xl text-5xl font-bold tracking-tight md:text-7xl">
          Turn resumes into
          <span className="block text-zinc-400">structured intelligence.</span>
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-8 text-zinc-400">
          Upload resumes, extract skills and experience with AI, preserve evidence,
          and search candidates using natural language.
        </p>
        <div className="mt-10 flex gap-4">
          <Link href="/upload" className="rounded-full bg-white px-6 py-3 font-medium text-black hover:bg-zinc-200">
            Upload Resume
          </Link>
          <Link href="/dashboard" className="rounded-full border border-zinc-700 px-6 py-3 font-medium hover:bg-zinc-900">
            Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
