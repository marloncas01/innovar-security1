import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/admin/", "/citas/", "/perfil", "/notificaciones", "/login", "/registro", "/recuperar"] },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
