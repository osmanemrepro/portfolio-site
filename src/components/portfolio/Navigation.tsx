"use client";

import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Github,
  Linkedin,
  Instagram,
  Twitter,
  MessageCircle,
  ExternalLink,
  Mail,
  Clock,
} from "lucide-react";
import LanguageSwitcher from "@/components/portfolio/LanguageSwitcher";
import { useLanguage } from "@/lib/i18n";

interface SocialLink {
  platform: string;
  url: string;
  icon?: string;
}

const socialIconMap: Record<string, React.ElementType> = {
  github: Github,
  linkedin: Linkedin,
  instagram: Instagram,
  twitter: Twitter,
  email: Mail,
  discord: MessageCircle,
};

const defaultSocials: SocialLink[] = [
  { platform: "github", url: "https://github.com" },
  { platform: "linkedin", url: "https://linkedin.com" },
  { platform: "twitter", url: "https://twitter.com" },
];

const navKeys = [
  { labelKey: "nav.about", href: "#about" },
  { labelKey: "nav.skills", href: "#skills" },
  { labelKey: "nav.projects", href: "#projects" },
  { labelKey: "nav.experience", href: "#experience" },
  { labelKey: "nav.contact", href: "#contact" },
];

/* ── Navbar Clock ──────────────────────────────────── */

const trDays = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
const enDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function NavClock() {
  const { lang } = useLanguage();
  const [time, setTime] = useState<Date | null>(null);
  const [colonVisible, setColonVisible] = useState(true);

  const noop = () => () => {};
  const getSnapshot = () => true;
  const getServerSnapshot = () => false;
  const isClient = useSyncExternalStore(noop, getSnapshot, getServerSnapshot);

  useEffect(() => {
    const tick = () => { setTime(new Date()); setColonVisible(p => !p); };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isClient || !time) return null;

  const h = time.getHours().toString().padStart(2, "0");
  const m = time.getMinutes().toString().padStart(2, "0");
  const days = lang === "tr" ? trDays : enDays;
  const dayStr = days[time.getDay()];
  const dateStr = `${time.getDate()}.${(time.getMonth() + 1).toString().padStart(2, "0")}`;

  return (
    <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06]">
      <Clock className="size-3.5 text-purple-400/50" />
      <span className="text-xs font-mono font-medium text-white/50 tracking-wider tabular-nums">
        {h}<span className={colonVisible ? "opacity-100" : "opacity-20"}>:</span>{m}
      </span>
      <span className="text-[10px] text-white/25 font-medium">{dayStr} {dateStr}</span>
    </div>
  );
}

export default function Navigation() {
  const { t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [socials, setSocials] = useState<SocialLink[]>(defaultSocials);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetch("/api/social-links")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSocials(data);
        }
      })
      .catch(() => {
        // Use defaults
      });
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsMobileOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled ? "glass-nav" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <motion.a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img
                src="/logo.png"
                alt="OE Logo"
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg object-contain"
              />
            </motion.a>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {navKeys.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="relative px-4 py-2 text-sm text-white/60 hover:text-white transition-colors duration-300 group"
                >
                  {t(link.labelKey)}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-purple-500 to-cyan-500 group-hover:w-3/4 transition-all duration-300" />
                </a>
              ))}
            </div>

            {/* Desktop Right */}
            <div className="hidden md:flex items-center gap-3">
              <NavClock />
              <LanguageSwitcher />
              {socials.map((social, i) => {
                const IconComp = socialIconMap[social.platform.toLowerCase()] || ExternalLink;
                return (
                  <motion.a
                    key={i}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full text-white/40 hover:text-white hover:bg-white/5 transition-all duration-300"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <IconComp className="w-4 h-4" />
                  </motion.a>
                );
              })}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              className="md:hidden p-2 text-white/70 hover:text-white"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              whileTap={{ scale: 0.9 }}
              aria-label="Toggle menu"
            >
              {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black/90 backdrop-blur-xl md:hidden"
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center justify-center h-full gap-8"
            >
              {navKeys.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  className="text-2xl font-semibold text-white/70 hover:text-white transition-colors"
                >
                  {t(link.labelKey)}
                </motion.a>
              ))}

              {/* Mobile Social Icons */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-4 mt-4"
              >
                {socials.map((social, i) => {
                  const IconComp = socialIconMap[social.platform.toLowerCase()] || ExternalLink;
                  return (
                    <a
                      key={i}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all duration-300"
                    >
                      <IconComp className="w-5 h-5" />
                    </a>
                  );
                })}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
