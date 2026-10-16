import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://osmanemreyaygin.osem.digital";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Osman Emre YAYGIN - Software Developer Portfolio",
  description:
    "Portfolio of Osman Emre YAYGIN — a learning-focused software developer crafting modern web experiences with React, Next.js, and TypeScript.",
  keywords: [
    "Osman Emre YAYGIN",
    "Software Developer",
    "Full Stack Developer",
    "React Developer",
    "Next.js Developer",
    "TypeScript",
    "Portfolio",
    "Web Development",
    "Frontend Developer",
  ],
  authors: [{ name: "Osman Emre YAYGIN", url: SITE_URL }],
  creator: "Osman Emre YAYGIN",
  publisher: "Osman Emre YAYGIN",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    alternateLocale: "en_US",
    url: SITE_URL,
    title: "Osman Emre YAYGIN - Software Developer Portfolio",
    description:
      "Portfolio of Osman Emre YAYGIN — a learning-focused software developer crafting modern web experiences with React, Next.js, and TypeScript.",
    siteName: "Osman Emre YAYGIN",
    images: [
      {
        url: `${SITE_URL}/logo.png`,
        width: 512,
        height: 512,
        alt: "Osman Emre YAYGIN Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Osman Emre YAYGIN - Software Developer Portfolio",
    description:
      "Portfolio of Osman Emre YAYGIN — a learning-focused software developer crafting modern web experiences.",
    images: [`${SITE_URL}/logo.png`],
  },
  alternates: {
    canonical: SITE_URL,
  },
  icons: { icon: "/logo.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#person`,
        name: "Osman Emre YAYGIN",
        url: SITE_URL,
        jobTitle: "Software Developer",
        description:
          "A learning-focused software developer crafting modern web experiences with React, Next.js, and TypeScript.",
        sameAs: ["https://github.com/osmanemrepro"],
        knowsAbout: [
          "React",
          "Next.js",
          "TypeScript",
          "Tailwind CSS",
          "Node.js",
          "Full-Stack Web Development",
          "UI/UX Design",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "Osman Emre YAYGIN - Portfolio",
        description:
          "Portfolio of Osman Emre YAYGIN — a learning-focused software developer crafting modern web experiences.",
        author: { "@id": `${SITE_URL}/#person` },
        inLanguage: ["tr", "en"],
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE_URL}/?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "ProfilePage",
        "@id": `${SITE_URL}/#profilepage`,
        url: SITE_URL,
        name: "Osman Emre YAYGIN - Software Developer Portfolio",
        about: { "@id": `${SITE_URL}/#person` },
        mainEntity: { "@id": `${SITE_URL}/#person` },
      },
    ],
  };

  return (
    <html lang="tr" className="dark" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground`}>
        <ThemeProvider>
          <I18nProvider>
            {children}
            <Toaster />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
