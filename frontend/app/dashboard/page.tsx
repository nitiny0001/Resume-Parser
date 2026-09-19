export default function DashboardPage() {
  const stats = [
    ["Resumes", "0"],
    ["Skills indexed", "0"],
    ["Candidates", "0"],
    ["Searches", "0"],
  ];

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm uppercase tracking-[0.25em] text-zinc-500">Workspace</p>
        <h1 className="mt-3 text-4xl font-bold">Candidate intelligence</h1>
        <p className="mt-3 text-zinc-400">Your extracted resume intelligence will appear here.</p>
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {stats.map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <p className="text-sm text-zinc-500">{label}</p>
              <p className="mt-3 text-3xl font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
