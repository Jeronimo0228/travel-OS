import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { ManagerDashboard } from "@/components/dashboard/ManagerDashboard";
import { HomeGate } from "@/components/landing/HomeGate";

const title = "Travel OS | Software para agencias de viajes y mayoristas · PDP";
const description =
  "Travel OS reúne CRM, cotizador con inteligencia artificial, itinerarios, portal del viajero y tablero gerencial para agencias de viajes y mayoristas. Entra a la demo real.";

export const metadata: Metadata = {
  title,
  description,
  metadataBase: new URL("https://travel-os.pdpcomunica.com"),
  alternates: { canonical: "/" },
  keywords: [
    "software agencias de viajes",
    "CRM agencia de viajes",
    "cotizador de viajes con IA",
    "software mayorista turismo",
    "portal del viajero",
    "Colombia",
  ],
  openGraph: {
    type: "website",
    url: "https://travel-os.pdpcomunica.com/",
    title: "Travel OS · Vende más viajes con menos trabajo",
    description,
    images: [{ url: "/landing/og.png", width: 1200, height: 630 }],
    locale: "es_CO",
  },
  twitter: { card: "summary_large_image", title, description, images: ["/landing/og.png"] },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Travel OS",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: "https://travel-os.pdpcomunica.com/",
  description,
  publisher: { "@type": "Organization", name: "PDP Comunica", url: "https://pdpcomunica.com", email: "contacto@pdpcomunica.com" },
  inLanguage: "es",
};

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HomeGate
        dashboard={
          <AppShell>
            <div>
              <h2 className="font-headline text-headline-xl text-primary mb-1">
                Comando de Inteligencia
              </h2>
              <p className="font-body-custom text-body-md text-on-surface-variant">
                Ventas, conversión, viajes y seguimiento de tu agencia en tiempo real.
              </p>
            </div>
            <ManagerDashboard />
          </AppShell>
        }
      />
    </>
  );
}
