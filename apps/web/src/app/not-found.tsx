import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
            <span
              className="material-symbols-outlined text-white"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              smart_toy
            </span>
          </div>
          <span className="font-headline text-headline-md font-bold text-primary">
            TravelOS AI
          </span>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-8">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant">
            explore_off
          </span>
          <h1 className="font-headline text-headline-lg text-primary mt-3 mb-1">
            Página no encontrada
          </h1>
          <p className="font-body-custom text-body-sm text-on-surface-variant mb-6">
            La ruta que buscas no existe o todavía no se ha construido.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-body-custom text-label-md hover:opacity-90 active:scale-[0.98] transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">home</span>
            Volver al panel
          </Link>
        </div>
      </div>
    </main>
  );
}
