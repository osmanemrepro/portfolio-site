"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Home,
  User,
  Code2,
  FolderGit2,
  Briefcase,
  Mail,
  ArrowRight,
  Hash,
  Sun,
  Moon,
  Monitor,
  Github,
  Linkedin,
  Twitter,
  X,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { useTheme, type Theme } from "@/lib/theme";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  action: () => void;
  category: string;
}

export default function CommandPalette() {
  const { t, lang } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const toggleTheme = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
    setIsOpen(false);
  }, [setTheme]);

  const scrollToSection = useCallback((id: string) => {
    const el = document.querySelector(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setIsOpen(false);
    }
  }, []);

  const openLink = useCallback((url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
    setIsOpen(false);
  }, []);

  const items: CommandItem[] = [
    {
      id: "nav-hero", label: t("cmd.home"), description: t("cmd.homeDesc"),
      icon: Home, category: t("cmd.category.nav"), action: () => scrollToSection("#hero"),
    },
    {
      id: "nav-about", label: t("nav.about"), description: t("cmd.aboutDesc"),
      icon: User, category: t("cmd.category.nav"), action: () => scrollToSection("#about"),
    },
    {
      id: "nav-skills", label: t("nav.skills"), description: t("cmd.skillsDesc"),
      icon: Code2, category: t("cmd.category.nav"), action: () => scrollToSection("#skills"),
    },
    {
      id: "nav-projects", label: t("nav.projects"), description: t("cmd.projectsDesc"),
      icon: FolderGit2, category: t("cmd.category.nav"), action: () => scrollToSection("#projects"),
    },
    {
      id: "nav-experience", label: t("nav.experience"), description: t("cmd.expDesc"),
      icon: Briefcase, category: t("cmd.category.nav"), action: () => scrollToSection("#experience"),
    },
    {
      id: "nav-contact", label: t("nav.contact"), description: t("cmd.contactDesc"),
      icon: Mail, category: t("cmd.category.nav"), action: () => scrollToSection("#contact"),
    },
    {
      id: "theme-dark", label: t("theme.dark"), description: t("cmd.themeDarkDesc"),
      icon: Moon, category: t("cmd.category.theme"), action: () => toggleTheme("dark"),
    },
    {
      id: "theme-light", label: t("theme.light"), description: t("cmd.themeLightDesc"),
      icon: Sun, category: t("cmd.category.theme"), action: () => toggleTheme("light"),
    },
    {
      id: "theme-auto", label: t("theme.auto"), description: t("cmd.themeAutoDesc"),
      icon: Monitor, category: t("cmd.category.theme"), action: () => toggleTheme("auto"),
    },
    {
      id: "link-github", label: "GitHub", description: t("cmd.githubDesc"),
      icon: Github, category: t("cmd.category.links"), action: () => openLink("https://github.com"),
    },
    {
      id: "link-linkedin", label: "LinkedIn", description: t("cmd.linkedinDesc"),
      icon: Linkedin, category: t("cmd.category.links"), action: () => openLink("https://linkedin.com"),
    },
    {
      id: "link-twitter", label: "Twitter", description: t("cmd.twitterDesc"),
      icon: Twitter, category: t("cmd.category.links"), action: () => openLink("https://twitter.com"),
    },
  ];

  const filtered = items.filter(
    (item) =>
      item.label.toLowerCase().includes(search.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(search.toLowerCase()))
  );

  // Group filtered items by category
  const grouped = filtered.reduce<Record<string, CommandItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input on open & reset search
  useEffect(() => {
    if (isOpen) {
      const focusTimer = setTimeout(() => inputRef.current?.focus(), 100);
      const clearTimer = requestAnimationFrame(() => setSearch(""));
      return () => { clearTimeout(focusTimer); cancelAnimationFrame(clearTimer); };
    }
  }, [isOpen]);

  // Block body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const [activeIndex, setActiveIndex] = useState(0);

  // Derive active index reset from search change using callback in setTimeout
  useEffect(() => {
    const id = requestAnimationFrame(() => setActiveIndex(0));
    return () => cancelAnimationFrame(id);
  }, [search]);

  const handleKeyDownInInput = (e: React.KeyboardEvent) => {
    const flatItems = filtered;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % flatItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + flatItems.length) % flatItems.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (flatItems[activeIndex]) {
        flatItems[activeIndex].action();
      }
    }
  };

  return (
    <>
      {/* Trigger badge in nav area */}
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 3, duration: 0.5 }}
        onClick={() => setIsOpen(true)}
        className="hidden md:flex fixed top-20 left-4 z-40 items-center gap-2 px-3 py-1.5 rounded-lg border border-white/8 bg-white/[0.03] text-white/25 hover:text-white/50 hover:border-white/15 hover:bg-white/[0.06] transition-all duration-300 text-xs font-mono"
      >
        <Search className="w-3 h-3" />
        <span>{lang === "tr" ? "Ara" : "Search"}</span>
        <kbd className="ml-1 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono">
          ⌘K
        </kbd>
      </motion.button>

      {/* Command Palette Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Palette */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-[15%] left-1/2 -translate-x-1/2 z-[201] w-full max-w-lg"
            >
              <div className="glass-card rounded-2xl overflow-hidden shadow-2xl border border-white/10"
                style={{
                  background: "rgba(15, 15, 25, 0.95)",
                  backdropFilter: "blur(24px)",
                  boxShadow: "0 25px 60px rgba(0,0,0,0.5), 0 0 40px rgba(139,92,246,0.1)",
                }}
              >
                {/* Search input */}
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.06]">
                  <Search className="w-4 h-4 text-white/30 shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={handleKeyDownInInput}
                    placeholder={lang === "tr" ? "Bir komut veya sayfa ara..." : "Type a command or search..."}
                    className="flex-1 bg-transparent text-sm text-white/80 placeholder:text-white/20 outline-none font-medium"
                  />
                  <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-white/30 font-mono">
                    ESC
                  </kbd>
                </div>

                {/* Results */}
                <div ref={listRef} className="max-h-[340px] overflow-y-auto py-2 px-2">
                  {filtered.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-10 text-white/20">
                      <Search className="w-8 h-8" />
                      <span className="text-sm">{lang === "tr" ? "Sonuç bulunamadı" : "No results found"}</span>
                    </div>
                  ) : (
                    Object.entries(grouped).map(([category, categoryItems]) => {
                      const categoryStartIndex = filtered.findIndex((i) => i.category === category);
                      return (
                        <div key={category}>
                          {/* Category label */}
                          <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/20">
                            {category}
                          </div>

                          {/* Items */}
                          {categoryItems.map((item) => {
                            const globalIndex = filtered.indexOf(item);
                            const isActive = globalIndex === activeIndex;
                            const Icon = item.icon;
                            return (
                              <motion.button
                                key={item.id}
                                onClick={() => item.action()}
                                onMouseEnter={() => setActiveIndex(globalIndex)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 group ${
                                  isActive
                                    ? "bg-white/[0.08] text-white"
                                    : "text-white/50 hover:text-white/70 hover:bg-white/[0.03]"
                                }`}
                              >
                                <div className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-colors duration-150 ${
                                  isActive
                                    ? "bg-purple-500/15 text-purple-400"
                                    : "bg-white/5 text-white/30 group-hover:bg-white/[0.08]"
                                }`}>
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium truncate">{item.label}</div>
                                  {item.description && (
                                    <div className="text-[11px] text-white/25 truncate">{item.description}</div>
                                  )}
                                </div>
                                {isActive && (
                                  <ArrowRight className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                )}
                              </motion.button>
                            );
                          })}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center gap-4 px-4 py-2.5 border-t border-white/[0.06] text-[10px] text-white/20">
                  <div className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/8 font-mono">↑↓</kbd>
                    <span>{lang === "tr" ? "Gezin" : "Navigate"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/8 font-mono">↵</kbd>
                    <span>{lang === "tr" ? "Seç" : "Select"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/8 font-mono">esc</kbd>
                    <span>{lang === "tr" ? "Kapat" : "Close"}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
