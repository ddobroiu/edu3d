import type { MetadataRoute } from "next";
import { baseUrl } from "@/lib/stripe";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Zone private sau fara valoare pentru cautare.
      disallow: ["/api/", "/parinte", "/clasa", "/autentificare", "/tarife/succes"],
    },
    sitemap: `${baseUrl()}/sitemap.xml`,
  };
}
