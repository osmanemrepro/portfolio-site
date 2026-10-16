import type { MetadataRoute } from "next";

const SITE_URL = "https://osmanemreyaygin.osem.digital";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // AI crawlers — explicit allow so they index the site
      {
        userAgent: "GPTBot", // OpenAI
        allow: "/",
        disallow: ["/admin", "/api"],
      },
      {
        userAgent: "ChatGPT-User", // ChatGPT web browsing
        allow: "/",
        disallow: ["/admin", "/api"],
      },
      {
        userAgent: "Google-Extended", // Google AI / Gemini
        allow: "/",
        disallow: ["/admin", "/api"],
      },
      {
        userAgent: "PerplexityBot", // Perplexity
        allow: "/",
        disallow: ["/admin", "/api"],
      },
      {
        userAgent: "CCBot", // Cohere / Common Crawl
        allow: "/",
        disallow: ["/admin", "/api"],
      },
      {
        userAgent: "ClaudeBot", // Anthropic Claude
        allow: "/",
        disallow: ["/admin", "/api"],
      },
      {
        userAgent: "Bytespider", // ByteDance / TikTok AI
        allow: "/",
        disallow: ["/admin", "/api"],
      },
      {
        userAgent: "FacebookBot", // Meta AI
        allow: "/",
        disallow: ["/admin", "/api"],
      },
      {
        userAgent: "Applebot-Extended", // Apple Intelligence
        allow: "/",
        disallow: ["/admin", "/api"],
      },
      // Catch-all
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
