import Image from "next/image";
import { AppShell } from "@/components/layout/AppShell";
import { MANUAL_SECTIONS } from "@/lib/manual";

export const metadata = { title: "Manual de uso · TravelOS" };

export default function HelpPage() {
  return (
    <AppShell searchPlaceholder="Buscar en el manual...">
      <div>
        <h2 className="font-headline text-headline-xl text-primary mb-1">Manual de uso</h2>
        <p className="font-body-custom text-body-md text-on-surface-variant">
          Paso a paso por tipo de usuario. Usuario demo: gerente@demo.travelos.local · agencia demo-agencia.
        </p>
      </div>

      <nav aria-label="Secciones del manual" className="flex flex-wrap gap-2">
        {MANUAL_SECTIONS.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="rounded-full border border-outline-variant px-3 py-1 text-label-sm text-primary hover:bg-primary-container/30"
          >
            {section.title}
          </a>
        ))}
      </nav>

      <div className="space-y-8">
        {MANUAL_SECTIONS.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 grid gap-6 lg:grid-cols-2"
          >
            <div>
              <h3 className="font-headline text-headline-md text-on-surface mb-2">{section.title}</h3>
              <div className="flex flex-wrap gap-1 mb-4">
                {section.roles.map((role) => (
                  <span key={role} className="rounded-full bg-primary-container/40 px-2 py-0.5 text-label-sm text-primary">
                    {role}
                  </span>
                ))}
              </div>
              <ol className="list-decimal pl-5 space-y-2 font-body-custom text-body-md text-on-surface-variant">
                {section.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
            {section.image && (
              <Image
                src={section.image}
                alt={`Captura: ${section.title}`}
                width={1600}
                height={1000}
                className="rounded-lg border border-outline-variant w-full h-auto"
              />
            )}
          </section>
        ))}
      </div>
    </AppShell>
  );
}
