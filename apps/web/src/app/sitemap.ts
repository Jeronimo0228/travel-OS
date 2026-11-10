import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: "https://travel-os.pdpcomunica.com/", changeFrequency: "weekly", priority: 1 }];
}
