import type { MetadataRoute } from "next";
import { publicUrl, siteUrl } from "../seo";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return siteUrl
    ? {
        rules: { userAgent: "*", allow: "/" },
        sitemap: publicUrl("/sitemap.xml"),
      }
    : { rules: { userAgent: "*", disallow: "/" } };
}
