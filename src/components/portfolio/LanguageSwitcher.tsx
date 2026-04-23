"use client";

import { motion } from "framer-motion";
import { Globe } from "lucide-react";
import { useLanguage, type Lang } from "@/lib/i18n";

export default function LanguageSwitcher() {
  const { lang, setLang, t } = useLanguage();

  const toggleLang = () => {
    setLang(lang === "tr" ? "en" : "tr");
  };

  return (
    <motion.button
      onClick={toggleLang}
      className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-white/10 text-white/40 hover:text-white hover:border-purple-500/40 hover:bg-purple-500/10 transition-all duration-300 text-xs font-medium tracking-wide"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={lang === "tr" ? "Switch to English" : "Türkçe'ye geç"}
    >
      <Globe className="w-3.5 h-3.5" />
      <span>{lang === "tr" ? "EN" : "TR"}</span>
    </motion.button>
  );
}
