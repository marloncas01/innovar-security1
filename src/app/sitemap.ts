import type { MetadataRoute } from "next";
import { publicPages, siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return publicPages.map((path) => ({ url: `${siteUrl}${path === "/" ? "" : path}`, changeFrequency: "monthly", priority: path === "/" ? 1 : path === "/servicios" || path === "/contacto" ? 0.8 : 0.5 }));
}
