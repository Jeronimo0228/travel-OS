import type { MetadataRoute } from "next";

const PRIVATE = [
  "/api/",
  "/portal",
  "/crm",
  "/cotizador",
  "/viajes",
  "/itinerario",
  "/agentes",
  "/settings",
  "/ayuda",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE },
      // Buscadores con IA: pueden leer la landing y llms.txt, no las zonas privadas.
      {
        userAgent: ["GPTBot", "OAI-SearchBot", "ClaudeBot", "PerplexityBot", "Google-Extended", "Applebot-Extended"],
        allow: ["/", "/llms.txt"],
        disallow: PRIVATE,
      },
    ],
    sitemap: "https://travel-os.pdpcomunica.com/sitemap.xml",
    host: "https://travel-os.pdpcomunica.com",
  };
}
