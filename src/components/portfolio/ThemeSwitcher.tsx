"use client";
import { motion } from "framer-motion";
import { useTheme, type Theme } from "@/lib/theme";
import { useLanguage } from "@/lib/i18n";

const themeOptions: { value: Theme; icon: string; labelKey: string }[] = [
  { value: "dark", icon: "🌙", labelKey: "theme.dark" },
  { value: "light", icon: "☀️", labelKey: "theme.light" },
  { value: "auto", icon: "💻", labelKey: "theme.auto" },
];

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();

  return (
    <div className="fixed top-20 right-4 z-40">
      <div className="glass-card p-1 flex gap-0.5 rounded-full">
        {themeOptions.map((opt) => (
          <motion.button
            key={opt.value}
            onClick={() => setTheme(opt.value)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`relative px-2.5 py-1.5 rounded-full text-[11px] font-medium flex items-center gap-1 transition-all duration-300 ${
              theme === opt.value
                ? "bg-primary/20 text-primary shadow-sm"
                : "text-foreground/40 hover:text-foreground/70 hover:bg-white/5"
            }`}
            title={t(opt.labelKey)}
            aria-label={t(opt.labelKey)}
          >
            <span className="text-sm">{opt.icon}</span>
            <span className="hidden lg:inline">{t(opt.labelKey)}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
