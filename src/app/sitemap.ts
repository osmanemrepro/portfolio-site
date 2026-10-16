import type { MetadataRoute } from "next";

const SITE_URL = "https://osmanemreyaygin.osem.digital";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/admin`,
      lastModified: new Date(),
      changeFrequency: "never",
      priority: 0.0,
    },
  ];
}
