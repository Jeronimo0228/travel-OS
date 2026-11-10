import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://travel-os.pdpcomunica.com";
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/login`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/privacidad`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/terminos`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
