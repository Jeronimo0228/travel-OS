import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Travel OS — Sistema operativo para agencias de viajes",
    short_name: "Travel OS",
    description: "CRM, cotizador con IA, itinerarios y portal del viajero para agencias y mayoristas.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f8fc",
    theme_color: "#0b1530",
    lang: "es-CO",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
