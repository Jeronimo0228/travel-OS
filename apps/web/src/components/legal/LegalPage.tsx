import Link from "next/link";
import type { ReactNode } from "react";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <main className="min-h-screen bg-surface px-4 py-10 sm:py-16">
      <article className="mx-auto max-w-3xl rounded-2xl border border-outline-variant bg-white p-6 sm:p-10 shadow-sm">
        <Link href="/" className="text-label-md font-semibold text-secondary hover:underline">
          ← Travel OS
        </Link>
        <h1 className="mt-4 font-headline text-headline-xl text-primary text-balance">{title}</h1>
        <p className="mt-1 text-body-sm text-on-surface-variant">Última actualización: {updated}</p>
        <div className="legal mt-8 space-y-4 text-body-md leading-relaxed text-on-surface [&_h2]:mt-8 [&_h2]:font-headline [&_h2]:text-headline-md [&_h2]:text-primary [&_li]:ml-5 [&_li]:list-disc">
          {children}
        </div>
      </article>
    </main>
  );
}
