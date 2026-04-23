"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="relative border-t border-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-1.5 text-sm text-white/30">
            <img src="/logo.png" alt="OE Logo" className="h-5 w-5 rounded object-contain opacity-70" />
            <span>{t("footer.builtWith")}</span>
            <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
            <span>by</span>
            <span className="text-white/50 font-medium">Osman Emre YAYGIN</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-xs text-white/20 font-mono">
              © {new Date().getFullYear()} {t("footer.rights")}
            </span>
            <a
              href="/admin"
              className="text-xs text-white/20 hover:text-white/40 transition-colors font-mono"
            >
              Admin
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
