export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-24">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600">
          TravelOS AI
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">
          Scaffold ready — start coding Sprint 1
        </h1>
        <p className="text-lg text-zinc-600">
          Monorepo prepared: web (Next.js), API (NestJS), shared (Zod), and Docker
          (Postgres + Redis). Open your role brief in{" "}
          <code className="rounded bg-zinc-200 px-1.5 py-0.5 text-sm">
            documentation/plans/sprint-1
          </code>
          .
        </p>
        <ul className="list-disc space-y-2 pl-5 text-zinc-700">
          <li>API health: http://localhost:4000/api/health</li>
          <li>Web: http://localhost:3000</li>
          <li>Prototype to reuse: github.com/nickamam08/TravelOS-AI-Ecosystem</li>
        </ul>
      </div>
    </main>
  );
}
